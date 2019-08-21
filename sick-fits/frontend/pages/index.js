// import React from 'react';
// done by next.js
import Items from '../components/Items'
import Link from 'next/link' // change page without reload

const Home = props => (
  <div>
    <Items page={parseFloat(props.query.page) || 1} />
  </div>
);

export default Home;