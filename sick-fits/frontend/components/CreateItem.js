import React from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import Form from './styles/Form'
import formatMoney from '../lib/formatMoney'
import Error from './ErrorMessage'
import Router from 'next/router'

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $price: Int!
    $image: String
    $largeImage: String
  ){
    createItem(
      title: $title
      description: $description
      image: $image
      largeImage: $largeImage
      price: $price
    ){
      id
    }
  }
`

class CreateItem extends React.Component {
  // state = {
  //   title: '',
  //   description: '',
  //   image: '',
  //   largeImage: '',
  //   price: 0,
  // }

  state = {
    title: 'title',
    description: 'description',
    image: '',
    largeImage: '',
    price: 1000,
  }

  handleChange = (e) => {
    const { name, type, value: val } = e.target
    const value = type === 'number' ? parseFloat(val) : val

    this.setState({
      [name]: value
    })
  }

  uploadFile = async (e) => {
    const files = e.target.files
    const data = new FormData()
    data.append('file', files[0])
    data.append('upload_preset', 'sickfits')

    const res = await fetch('https://api.cloudinary.com/v1_1/dkps8tqie/image/upload', {
      method: 'POST',
      body: data
    })

    const file = await res.json()

    console.log(file)

    this.setState({
      image: file.secure_url,
      largeImage: file.eager[0].secure_url
    })
  }

  render() {
    return (
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state} >
        {(createItem, { loading, error }) => (
          <Form onSubmit={async (e) => {
            e.preventDefault()
            // args are passed in component
            const res = await createItem()

            Router.push({
              pathname: '/item',
              query: {
                id: res.data.createItem.id
              }
            })
          }}>
            <Error error={error} />
            <fieldset disabled={loading} aria-busy={loading}>

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

              <label htmlFor="title">
                Title
                <input
                  onChange={this.handleChange}
                  value={this.state.title}
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
                  value={this.state.price}
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
                  value={this.state.description}
                  id="description"
                  name="description"
                  placeholder="Enter a description"
                  required />
              </label>

              <button type="submit">Submit</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

export default CreateItem;

export {
  CREATE_ITEM_MUTATION
}