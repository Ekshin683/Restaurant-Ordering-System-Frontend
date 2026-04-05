# Restaurant Ordering System - Frontend

A beautiful and responsive React frontend for the Restaurant Ordering System with complete user and admin functionality.

## 🎨 Features

### User Features
- ✅ User Authentication (Register/Login)
- ✅ Beautiful Home Page with Categories
- ✅ Menu Browsing with Search & Filters
  - Search by name
  - Filter by category
  - Filter by price range
- ✅ Shopping Cart Management
- ✅ Order Placement
- ✅ Order History & Tracking
- ✅ User Profile Management
- ✅ Responsive Design (Mobile-Friendly)

### Admin Features (Admin Only)
- ✅ Menu Item Management (CRUD)
  - Add new menu items
  - Edit existing items
  - Delete items
  - Toggle availability
- ✅ Order Management
  - View all orders
  - Update order status
  - Delete orders
- ✅ User Management
  - View all users
  - Delete users

## 🚀 Quick Start

### Installation

1. **Navigate to frontend folder:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
frontend/
├── public/
│   ├── index.html           # HTML template
│   └── manifest.json        # PWA manifest
├── src/
│   ├── components/
│   │   ├── Navbar.js        # Navigation component
│   │   └── Navbar.css
│   ├── context/
│   │   ├── AuthContext.js   # Authentication context
│   │   └── CartContext.js   # Shopping cart context
│   ├── pages/
│   │   ├── Home.js          # Landing page
│   │   ├── Login.js         # Login page
│   │   ├── Register.js      # Registration page
│   │   ├── Menu.js          # Menu browsing page
│   │   ├── Cart.js          # Shopping cart page
│   │   ├── Orders.js        # Order history page
│   │   ├── Profile.js       # User profile page
│   │   ├── AdminDashboard.js # Admin panel
│   │   └── *.css            # Page styles
│   ├── services/
│   │   └── api.js           # API service layer
│   ├── App.js               # Main app component
│   ├── App.css
│   ├── index.js             # Entry point
│   └── index.css            # Global styles
├── .env                     # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🎯 Available Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Home page |
| `/menu` | Public | Browse menu items |
| `/login` | Public | User login |
| `/register` | Public | User registration |
| `/cart` | Private | Shopping cart |
| `/orders` | Private | Order history |
| `/profile` | Private | User profile |
| `/admin` | Admin Only | Admin dashboard |

## 💻 Technologies Used

- **React 18** - UI Library
- **React Router v6** - Routing
- **Axios** - HTTP Client
- **Context API** - State Management
- **CSS3** - Styling with modern animations

## 🎨 Design Features

### Modern UI/UX
- **Gradient backgrounds** - Beautiful purple gradient theme
- **Smooth animations** - Fade-in, slide-in effects
- **Responsive design** - Works on all devices
- **Interactive cards** - Hover effects and transitions
- **Custom buttons** - Gradient buttons with animations
- **Clean typography** - Poppins font family

### Color Scheme
- Primary: `#667eea` (Purple)
- Secondary: `#764ba2` (Dark Purple)
- Success: `#28a745`
- Danger: `#dc3545`
- Warning: `#ffc107`

## 📱 Responsive Breakpoints

- Desktop: > 768px
- Mobile: ≤ 768px

## 🔐 Authentication Flow

1. **User Registration**
   - Enter name, email, password
   - Auto-login after successful registration
   - JWT token stored in localStorage

2. **User Login**
   - Enter email and password
   - Receive JWT token
   - Token automatically added to all API requests

3. **Protected Routes**
   - Automatically redirect to login if not authenticated
   - Admin routes check for admin role

## 🛒 Shopping Cart Features

- Add items to cart
- Update quantities
- Remove items
- Persistent cart (localStorage)
- Real-time total calculation
- One-click order placement

## 📦 Order Management

### User View
- View order history
- Filter by status (pending/completed/cancelled)
- See order details and items
- Track total amount

### Admin View
- View all orders from all users
- Update order status
- Delete orders
- See customer information

## 👤 Profile Management

- View user information
- Edit name and email
- View role badge (User/Admin)
- View member since date
- Logout functionality

## 👨‍💼 Admin Dashboard

### Menu Management
- Create new menu items
- Edit existing items
- Delete items
- Toggle availability
- Set prices and categories

### Order Management
- View all orders
- Change order status
- Delete orders
- Filter by various criteria

### User Management
- View all registered users
- See user roles
- Delete users
- View join dates

## 🎭 Demo Credentials

After seeding the backend database:

**Admin Account:**
- Email: `admin@restaurant.com`
- Password: `admin123`

**User Account:**
- Email: `john@example.com`
- Password: `user123`

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

### Deployment Platforms

- **Vercel** (Recommended for React)
- **Netlify**
- **GitHub Pages**
- **Firebase Hosting**

### Environment Variables for Production

Update `.env` with your production API URL:
```env
REACT_APP_API_URL=https://your-api-domain.com/api
```

## 🔗 Connecting to Backend

Make sure your backend server is running on `http://localhost:5000` or update the API URL in `.env`.

The frontend automatically:
- Adds JWT token to requests
- Handles authentication
- Manages cart persistence
- Handles API errors

## 📝 Available Scripts

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from create-react-app
```

## ✨ Key Features Explained

### Context API Usage

**AuthContext** - Manages user authentication:
- Login/Logout
- User data
- Token management
- Admin role checking

**CartContext** - Manages shopping cart:
- Add/Remove items
- Update quantities
- Total calculations
- Persistent storage

### Protected Routes

- Uses custom `ProtectedRoute` component
- Automatically redirects to login
- Admin routes check for admin role
- Loading states during auth check

### API Integration

- Centralized API service
- Automatic token injection
- Error handling
- Response interceptors

## 🎨 UI Components

### Reusable Styles
- `.btn` - Button styles (primary, secondary, danger, success)
- `.card` - Card containers with shadows
- `.badge` - Status badges
- `.alert` - Alert messages
- `.spinner` - Loading spinner

### Animations
- `fadeIn` - Fade in animation
- `slideIn` - Slide in animation
- `pulse` - Pulse animation
- Hover effects on cards and buttons

## 🐛 Troubleshooting

### CORS Issues
If you get CORS errors:
1. Make sure backend CORS is configured
2. Check API URL in `.env`
3. Restart both servers

### Authentication Issues
If login doesn't work:
1. Check backend is running
2. Verify credentials
3. Check browser console for errors
4. Clear localStorage and try again

### Cart Not Persisting
If cart clears unexpectedly:
1. Check localStorage permissions
2. Verify CartContext is properly wrapped
3. Check browser console

## 📄 License

ISC

## 👨‍💻 Developer Notes

### Code Structure
- Functional components with hooks
- Context API for global state
- CSS modules for styling
- Axios for API calls
- React Router for navigation

### Best Practices Followed
- Clean code structure
- Reusable components
- Proper error handling
- Loading states
- Responsive design
- Accessibility considerations

---

**Built with ❤️ using React**
