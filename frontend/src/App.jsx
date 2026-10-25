import { useEffect, useState } from 'react'
import './App.css'
import { apiRequest } from './api'

function App() {
  const [page, setPage] = useState(
    localStorage.getItem('token') ? 'dashboard' : 'login'
  )

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [vehicles, setVehicles] = useState([])
  const [search, setSearch] = useState('')
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null
    } catch {
      return null
    }
  })

  // Load all vehicles, then filter locally so search matches make OR model OR category.
  async function loadVehicles(searchText = '') {
    try {
      const data = await apiRequest('/vehicles')
      const allVehicles = Array.isArray(data) ? data : data.vehicles || []
      const query = searchText.trim().toLowerCase()

      const filteredVehicles = query
        ? allVehicles.filter((vehicle) =>
            [vehicle.make, vehicle.model, vehicle.category].some((value) =>
              String(value || '').toLowerCase().includes(query)
            )
          )
        : allVehicles

      setVehicles(filteredVehicles)
      setMessage('')
    } catch (error) {
      setMessage(error.message || 'Unable to load vehicles.')
    }
  }

  useEffect(() => {
    if (page === 'dashboard') {
      loadVehicles(search)
    }
    // Load inventory when the user enters the dashboard.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  function updateForm(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      if (page === 'register') {
        await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify(form),
        })

        setMessage('Registration successful! Please log in.')
        setPage('login')
        setForm({ name: '', email: form.email, password: '' })
      } else {
        const data = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        })

        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        setUser(data.user)
        setPage('dashboard')
        setMessage('')
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function purchaseVehicle(vehicleId) {
    try {
      await apiRequest(`/vehicles/${vehicleId}/purchase`, {
        method: 'POST',
      })

      setMessage('Vehicle purchased successfully!')
      await loadVehicles(search)
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function deleteVehicle(vehicleId) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this vehicle?'
    )
    if (!confirmed) return

    try {
      await apiRequest(`/vehicles/${vehicleId}`, {
        method: 'DELETE',
      })

      setMessage('Vehicle deleted successfully!')
      await loadVehicles(search)
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function restockVehicle(vehicleId) {
    const input = window.prompt('Enter the quantity to add:')
    if (input === null || input.trim() === '') return

    const quantity = Number(input)
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setMessage('Please enter a positive whole number.')
      return
    }

    try {
      await apiRequest(`/vehicles/${vehicleId}/restock`, {
        method: 'POST',
        body: JSON.stringify({ quantity }),
      })

      setMessage('Vehicle restocked successfully!')
      await loadVehicles(search)
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function updateVehicle(event) {
    event.preventDefault()
    if (!editingVehicle) return

    const formElement = event.currentTarget
    const formData = new FormData(formElement)

    const vehicle = {
      make: String(formData.get('make') || '').trim(),
      model: String(formData.get('model') || '').trim(),
      category: String(formData.get('category') || '').trim(),
      price: Number(formData.get('price')),
      quantity: Number(formData.get('quantity')),
    }

    if (
      !vehicle.make ||
      !vehicle.model ||
      !vehicle.category ||
      !Number.isFinite(vehicle.price) ||
      vehicle.price < 0 ||
      !Number.isInteger(vehicle.quantity) ||
      vehicle.quantity < 0
    ) {
      setMessage('Please enter valid vehicle details.')
      return
    }

    try {
      await apiRequest(`/vehicles/${editingVehicle.id}`, {
        method: 'PUT',
        body: JSON.stringify(vehicle),
      })

      setEditingVehicle(null)
      setMessage('Vehicle updated successfully!')
      await loadVehicles(search)
    } catch (error) {
      setMessage(error.message)
    }
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setVehicles([])
    setSearch('')
    setEditingVehicle(null)
    setMessage('')
    setForm({ name: '', email: '', password: '' })
    setPage('login')
  }

  if (page === 'login' || page === 'register') {
    return (
      <div className="auth-page">
        <div className="auth-decoration">
          <div className="auth-brand">🚘 AutoHub</div>

          <div>
            <p className="eyebrow">YOUR JOURNEY STARTS HERE</p>
            <h1>Find the right car for your next adventure.</h1>
            <p>Explore vehicles and manage dealership inventory in one place.</p>
          </div>

          <p className="auth-bottom">Car Dealership Inventory System</p>
        </div>

        <div className="auth-panel">
          <form className="auth-form" onSubmit={handleSubmit}>
            <span className="form-label">WELCOME TO AUTOHUB</span>

            <h2>
              {page === 'login' ? 'Welcome back!' : 'Create an account'}
            </h2>

            <p className="form-description">
              {page === 'login'
                ? 'Enter your details to sign in.'
                : 'Register to explore our vehicle inventory.'}
            </p>

            {page === 'register' && (
              <label>
                Full name
                <input
                  name="name"
                  value={form.name}
                  onChange={updateForm}
                  placeholder="Enter your name"
                  required
                />
              </label>
            )}

            <label>
              Email address
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={updateForm}
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={updateForm}
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
            </label>

            {message && <div className="auth-message">{message}</div>}

            <button className="auth-button" disabled={loading}>
              {loading
                ? 'Please wait...'
                : page === 'login'
                  ? 'Sign In'
                  : 'Create Account'}
            </button>

            <p className="switch-page">
              {page === 'login'
                ? "Don't have an account?"
                : 'Already registered?'}

              <button
                type="button"
                onClick={() => {
                  setPage(page === 'login' ? 'register' : 'login')
                  setMessage('')
                }}
              >
                {page === 'login' ? 'Create account' : 'Sign in'}
              </button>
            </p>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>🚘 AutoHub</h2>
        <p className="menu-heading">MAIN MENU</p>
        <div className="menu-item active">▦ Dashboard</div>
        <div className="menu-item">🚗 Inventory</div>

        {user?.role === 'admin' && (
          <div className="menu-item">📦 Admin Stock Management</div>
        )}

        <button className="logout-button" onClick={logout}>
          Sign Out
        </button>

        <div className="sidebar-footer">Car Dealership System</div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Vehicle Inventory</h1>
            <p>Welcome, {user?.name || 'Customer'}! Explore our vehicles.</p>
          </div>

          <div className="profile">👤 {user?.role || 'user'}</div>
        </header>

        <section className="stats">
          <div className="stat-card">
            <span>Total Models</span>
            <h2>{vehicles.length}</h2>
            <p>Vehicle models in the inventory</p>
          </div>

          <div className="stat-card">
            <span>Total Stock</span>
            <h2>
              {vehicles.reduce(
                (total, vehicle) => total + Number(vehicle.quantity),
                0
              )}
            </h2>
            <p>Vehicles currently in stock</p>
          </div>

          <div className="stat-card">
            <span>Out of Stock</span>
            <h2>
              {
                vehicles.filter((vehicle) => Number(vehicle.quantity) === 0)
                  .length
              }
            </h2>
            <p>Models currently unavailable</p>
          </div>
        </section>

        {user?.role === 'admin' && (
          <section className="inventory-section admin-section">
            <h2>Add a Vehicle</h2>

            <form
              className="vehicle-form"
              onSubmit={async (event) => {
                event.preventDefault()
                const formElement = event.currentTarget
                const formData = new FormData(formElement)

                const vehicle = {
                  make: String(formData.get('make') || '').trim(),
                  model: String(formData.get('model') || '').trim(),
                  category: String(formData.get('category') || '').trim(),
                  price: Number(formData.get('price')),
                  quantity: Number(formData.get('quantity')),
                }

                try {
                  await apiRequest('/vehicles', {
                    method: 'POST',
                    body: JSON.stringify(vehicle),
                  })

                  formElement.reset()
                  setMessage('Vehicle added successfully!')
                  await loadVehicles(search)
                } catch (error) {
                  setMessage(error.message)
                }
              }}
            >
              <input name="make" placeholder="Vehicle make" required />
              <input name="model" placeholder="Vehicle model" required />

              <select name="category" required defaultValue="">
                <option value="" disabled>
                  Select category
                </option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Electric">Electric</option>
                <option value="Luxury">Luxury</option>
              </select>

              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Price"
                required
              />

              <input
                name="quantity"
                type="number"
                min="0"
                step="1"
                placeholder="Quantity"
                required
              />

              <button className="purchase-button" type="submit">
                Add Vehicle
              </button>
            </form>
          </section>
        )}

        {user?.role === 'admin' && editingVehicle && (
          <section className="inventory-section admin-section">
            <h2>Edit Vehicle</h2>
            <form className="vehicle-form" onSubmit={updateVehicle}>
              <input
                name="make"
                defaultValue={editingVehicle.make}
                placeholder="Vehicle make"
                required
              />
              <input
                name="model"
                defaultValue={editingVehicle.model}
                placeholder="Vehicle model"
                required
              />
              <select
                name="category"
                defaultValue={editingVehicle.category}
                required
              >
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Electric">Electric</option>
                <option value="Luxury">Luxury</option>
              </select>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={editingVehicle.price}
                placeholder="Price"
                required
              />
              <input
                name="quantity"
                type="number"
                min="0"
                step="1"
                defaultValue={editingVehicle.quantity}
                placeholder="Quantity"
                required
              />
              <button className="purchase-button" type="submit">
                Save Changes
              </button>
              <button
                className="admin-secondary-button"
                type="button"
                onClick={() => setEditingVehicle(null)}
              >
                Cancel
              </button>
            </form>
          </section>
        )}

        <section className="inventory-section">
          <div className="inventory-header">
            <div>
              <h2>Available Vehicles</h2>
              <p>Browse the dealership inventory.</p>
            </div>

            <input
              type="search"
              placeholder="Search make, model, or category..."
              value={search}
              onChange={(event) => {
                const value = event.target.value
                setSearch(value)
                loadVehicles(value)
              }}
            />
          </div>

          {message && <div className="auth-message">{message}</div>}

          {vehicles.length === 0 ? (
            <p className="empty-message">
              No vehicles found. An administrator can add vehicles to the
              inventory.
            </p>
          ) : (
            <div className="vehicle-grid">
              {vehicles.map((vehicle) => (
                <article className="vehicle-card" key={vehicle.id}>
                  <div className="vehicle-image">🚘</div>

                  <div className="vehicle-details">
                    <span className="category">{vehicle.category}</span>
                    <h3>
                      {vehicle.make} {vehicle.model}
                    </h3>

                    <p className="price">
                      ${Number(vehicle.price).toLocaleString('en-US')}
                    </p>

                    <div className="stock-row">
                      <span>Stock quantity</span>
                      <strong>{vehicle.quantity}</strong>
                    </div>

                    <button
                      className="purchase-button"
                      disabled={Number(vehicle.quantity) === 0}
                      onClick={() => purchaseVehicle(vehicle.id)}
                    >
                      {Number(vehicle.quantity) === 0
                        ? 'Out of Stock'
                        : 'Purchase Vehicle'}
                    </button>

                    {user?.role === 'admin' && (
                      <div className="admin-actions">
                        <button
                          className="admin-secondary-button"
                          onClick={() => {
                            setEditingVehicle(vehicle)
                            setMessage('')
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                        >
                          Edit
                        </button>

                        <button
                          className="admin-secondary-button"
                          onClick={() => restockVehicle(vehicle.id)}
                        >
                          Restock
                        </button>

                        <button
                          className="admin-delete-button"
                          onClick={() => deleteVehicle(vehicle.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
