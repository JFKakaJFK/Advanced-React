import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Link from 'next/link'

import Title from './styles/Title'
import PriceTag from './styles/PriceTag'
import ItemStyles from './styles/ItemStyles'
import DeleteItem from './DeleteItem'

import formatMoney from '../lib/formatMoney'

class Item extends React.Component {
  render() {
    const { item } = this.props

    return (
      <ItemStyles>
        {item.image && <img src={item.image} alt={item.title} />}
        <Title>
          <Link href={{
            pathname: '/item',
            query: {
              id: item.id
            }
          }}>
            <a>{item.title}</a>
          </Link>
        </Title>
        <PriceTag>{formatMoney(item.price)}</PriceTag>
        <p>{item.description}</p>
        <div className="buttonList">
          <Link href={{
            pathname: '/update',
            query: {
              id: item.id
            }
          }}>
            <a>Edit</a>
          </Link>
          <button>Add to Cart</button>
          <DeleteItem id={item.id}>Delete Item</DeleteItem>
        </div>
      </ItemStyles>
    )
  }
}

Item.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    image: PropTypes.string,
    largeImage: PropTypes.string,
  }).isRequired
}

export default Item