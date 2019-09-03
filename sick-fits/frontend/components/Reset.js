import React from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import Form from './styles/Form'
import Error from './ErrorMessage'
import { CURRENT_USER_QUERY } from './User'

const RESET_PASSWORD_MUTATION = gql`
  mutation RESET_PASSWORD_MUTATION($resetToken: String!, $password: String!, $confirmPassword: String!){
    resetPassword(
      resetToken: $resetToken
      password: $password
      confirmPassword: $confirmPassword
    ){
      id
      email
      name
    }
  }
`

class Reset extends React.Component {
  state = {
    password: '',
    confirmPassword: ''
  }

  saveToState = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  render() {
    return (
      <Mutation refetchQueries={[{ query: CURRENT_USER_QUERY }]} mutation={RESET_PASSWORD_MUTATION} variables={{
        resetToken: this.props.resetToken,
        password: this.state.password,
        confirmPassword: this.state.confirmPassword
      }}>
        {(resetPassword, { error, loading }) => (
          <Form method="POST" onSubmit={async (e) => {
            e.preventDefault()
            await resetPassword()
            this.setState({
              password: '',
              confirmPassword: ''
            })
          }}>
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Request a password reset</h2>
              <Error error={error} />

              <label htmlFor="password">
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={this.state.password}
                  onChange={this.saveToState}
                />
              </label>

              <label htmlFor="confirmPassword">
                Confirm your Password
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={this.state.confirmPassword}
                  onChange={this.saveToState}
                />
              </label>

              <button type="submit">Reset your password</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

Reset.propTypes = {
  resetToken: PropTypes.string.isRequired
}

export default Reset