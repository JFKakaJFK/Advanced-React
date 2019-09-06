import React from 'react'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import Table from './styles/Table'
import SickButton from './styles/SickButton'
import PropTypes from 'prop-types'

import Error from './ErrorMessage'

const ALL_USERS_QUERY = gql`
  query ALL_USERS_QUERY {
    users {
      id
      name
      email
      permissions
    }
  }
`

const possiblePermissions = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE'
]

const Permissions = props => (
  <Query query={ALL_USERS_QUERY}>
    {({ data, loading, error }) => <div>
      <Error error={error} />
      <div>
        <h2>Manage Permissions</h2>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              {possiblePermissions.map(permission => <th key={permission}>{permission}</th>)}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.users.map(user => <UserPermissions key={user.id} user={user} />)}
          </tbody>
        </Table>
      </div>
    </div>}
  </Query>
)

const UPDATE_PERMISSIONS_MUTATION = gql`
  mutation UPDATE_PERMISSIONS_MUTATION($permissions: [Permission]!, $userId: ID!){
    updatePermissions(permissions: $permissions, userId: $userId){
      id
      permissions
      name
      email
    }
  }
`

class UserPermissions extends React.Component {
  constructor(props) {
    super(props)

    const { user: {
      permissions,
    } } = props

    this.state = {
      permissions
    }
  }

  handlePermissionChange = (e) => {
    const checkbox = e.target
    let updatedPermissions = [...this.state.permissions]
    if (checkbox.checked) {
      updatedPermissions.push(checkbox.value)
    } else {
      updatedPermissions = updatedPermissions.filter(p => p !== checkbox.value)
    }

    this.setState({
      permissions: updatedPermissions
    })
  }

  render() {
    const { user } = this.props
    return (
      <Mutation mutation={UPDATE_PERMISSIONS_MUTATION} variables={{
        permissions: this.state.permissions,
        userId: this.props.user.id
      }}
      >{(updatePermissions, { loading, error }) => <>
        {error && <tr><td colSpan="8"><Error error={error} /></td></tr>}
        <tr key={user.id}>
          <td>{user.name}</td>
          <td>{user.email}</td>
          {possiblePermissions.map(permission => <td key={permission}>
            <label htmlFor={`${user.id}-permission-${permission}`}>
              <input
                id={`${user.id}-permission-${permission}`}
                type="checkbox"
                checked={this.state.permissions.includes(permission)}
                value={permission}
                onChange={this.handlePermissionChange}
              />
            </label>
          </td>)}
          <td>
            <SickButton
              type="button"
              disabled={loading}
              onClick={updatePermissions}
            >
              Updat{loading ? 'ing' : 'e'}
            </SickButton>
          </td>
        </tr>
      </>}</Mutation>
    )
  }
}

UserPermissions.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    permissions: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired
}

export default Permissions
export {
  ALL_USERS_QUERY,
  UPDATE_PERMISSIONS_MUTATION
}