// React-tienda/src/components/ProductDetail.jsx
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

function ProductDetail() {
  const { id } = useParams()
  const { data, error } = useSWR(`https://fakestoreapi.com/products/${id}`, fetcher)

  if (error) return <div>Failed to load product</div>
  if (!data) return <div>Loading...</div>

  return (
    <div className="p-4">
      <div className="card bg-white shadow-lg rounded-lg overflow-hidden p-6">
        <img src={data.image} alt={data.title} className="w-full h-48 object-contain mb-4" />
        <h2 className="text-2xl font-bold mb-4">{data.title}</h2>
        <p className="text-gray-700 mb-4">${data.price}</p>
        <p className="text-gray-700 mb-4">{data.description}</p>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    </div>
  )
}

export default ProductDetail