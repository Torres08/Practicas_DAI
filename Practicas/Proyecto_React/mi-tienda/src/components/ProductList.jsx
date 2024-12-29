// mi-tienda/src/ProductList.jsx    
import React from 'react'
import useSWR from 'swr'
import { Link } from 'react-router-dom'

const fetcher = (url) => fetch(url).then((res) => res.json())

function ProductList() {
  const { data, error } = useSWR('https://fakestoreapi.com/products', fetcher)

  if (error) return <div>Failed to load products</div>
  if (!data) return <div>Loading...</div>

  return (
    <div className="p-4 "> {/* Añade relleno superior */}
      <div className="card rounded-lg overflow-hidden p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data.map((product) => (
            <div key={product.id} className="card bg-white shadow-lg rounded-lg overflow-hidden p-4 flex flex-col justify-between h-full">
              <div className="flex flex-col items-center mb-4">
                <img src={product.image} alt={product.title} className="w-full h-48 object-contain mb-4" />
                <h5 className="text-lg font-semibold mb-2 text-center text-black">{product.title}</h5>
              </div>
              <div className="flex flex-col items-center mt-auto">
                <p className="text-gray-700 mb-4 text-center">${product.price}</p>
                <Link to={`/product/${product.id}`} className="btn btn-primary">Buy now</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProductList