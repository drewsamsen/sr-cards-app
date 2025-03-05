import { DataTable } from "@/components/data-table"
import { columns } from "@/components/columns"
import { Header } from "@/components/header"

// Sample data for the table
const data = [
  {
    id: "1",
    name: "Apple iPhone 13",
    category: "Electronics",
    price: 799,
    stock: 45,
    rating: 4.8,
  },
  {
    id: "2",
    name: "Samsung Galaxy S22",
    category: "Electronics",
    price: 749,
    stock: 32,
    rating: 4.7,
  },
  {
    id: "3",
    name: "Sony WH-1000XM4",
    category: "Audio",
    price: 349,
    stock: 18,
    rating: 4.9,
  },
  {
    id: "4",
    name: "MacBook Pro M2",
    category: "Computers",
    price: 1299,
    stock: 12,
    rating: 4.8,
  },
  {
    id: "5",
    name: "iPad Air",
    category: "Tablets",
    price: 599,
    stock: 27,
    rating: 4.6,
  },
  {
    id: "6",
    name: "Logitech MX Master 3",
    category: "Accessories",
    price: 99,
    stock: 53,
    rating: 4.7,
  },
  {
    id: "7",
    name: "Dell XPS 13",
    category: "Computers",
    price: 999,
    stock: 8,
    rating: 4.5,
  },
  {
    id: "8",
    name: "Bose QuietComfort 45",
    category: "Audio",
    price: 329,
    stock: 22,
    rating: 4.6,
  },
]

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Browse and sort our product inventory.</p>
        </div>
        <div className="mt-6">
          <DataTable columns={columns} data={data} />
        </div>
      </main>
    </div>
  )
}

