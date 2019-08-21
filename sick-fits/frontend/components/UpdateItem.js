import React from 'react'
import { Mutation, Query } from 'react-apollo'
import gql from 'graphql-tag'
import Form from './styles/Form'
import formatMoney from '../lib/formatMoney'
import Error from './ErrorMessage'
import Router from 'next/router'

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY(
    $id: ID!
  ){
    item(where: { id: $id }){
      title
      description
      price
      image
      largeImage
    }
  }
`

const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION(
    $id: ID!
    $title: String
    $description: String
    $price: Int
  ){
    updateItem(
      id: $id
      title: $title
      description: $description
      price: $price
    ){
      id
      title
      description
      price
    }
  }
`

class UpdateItem extends React.Component {
  state = {}

  handleChange = (e) => {
    const { name, type, value: val } = e.target
    const value = type === 'number' ? parseFloat(val) : val

    this.setState({
      [name]: value
    })
  }

  // uploadFile = async (e) => {
  //   const files = e.target.files
  //   const data = new FormData()
  //   data.append('file', files[0])
  //   data.append('upload_preset', 'sickfits')

  //   const res = await fetch('https://api.cloudinary.com/v1_1/dkps8tqie/image/upload', {
  //     method: 'POST',
  //     body: data
  //   })

  //   const file = await res.json()

  //   console.log(file)

  //   this.setState({
  //     image: file.secure_url,
  //     largeImage: file.eager[0].secure_url
  //   })
  // }

  updateItem = async (e, updateItem) => {
    e.preventDefault()
    // args are passed in component
    const res = await updateItem({
      variables: {
        id: this.props.id,
        ...this.state
      }
    })

    Router.push({
      pathname: '/item',
      query: {
        id: res.data.updateItem.id
      }
    })
  }

  render() {
    return (
      <Query query={SINGLE_ITEM_QUERY} variables={{ id: this.props.id }}>
        {({ data, loading, error }) => {
          if (error) return <p>Something went wrong</p>
          if (loading) return <p>Loading...</p>
          if (!data.item) return <p>No Item Found</p>
          return (
            <Mutation mutation={UPDATE_ITEM_MUTATION} variables={this.state} >
              {(updateItem, { loading, error }) => (
                <Form onSubmit={e => this.updateItem(e, updateItem)}>
                  <Error error={error} />
                  <fieldset disabled={loading} aria-busy={loading}>

                    {/*
                  <label htmlFor="file">
                    Image
                    <input
                      onChange={this.uploadFile}
                      type="file"
                      id="file"
                      name="file"
                      placeholder="Upload an image"
                      required />
                  </label>
                  */}

                    <label htmlFor="title">
                      Title
                    <input
                        onChange={this.handleChange}
                        defaultValue={data.item.title}
                        type="text"
                        id="title"
                        name="title"
                        placeholder="Title"
                        required />
                    </label>

                    <label htmlFor="price">
                      Price
                <input
                        onChange={this.handleChange}
                        defaultValue={data.item.price}
                        type="number"
                        id="price"
                        name="price"
                        placeholder="Price"
                        required />
                    </label>

                    <label htmlFor="description">
                      Description
                <textarea
                        onChange={this.handleChange}
                        defaultValue={data.item.description}
                        id="description"
                        name="description"
                        placeholder="Enter a description"
                        required />
                    </label>

                    <button type="submit">Sav{loading ? 'ing' : 'e'} Changes</button>
                  </fieldset>
                </Form>
              )}
            </Mutation>
          )
        }}
      </Query>
    )
  }
}

export default UpdateItem;

export {
  UPDATE_ITEM_MUTATION,
  SINGLE_ITEM_QUERY
}