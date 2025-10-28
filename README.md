# BeeGrub - Campus Food Pre-Order App

BeeGrub is a hyper-local digital platform designed as a canteen food pre-order and pickup solution specifically for the BINUS Anggrek Campus ecosystem.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- React Native development environment

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd BeeGrubApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key
   - Update `src/services/supabase.js` with your credentials:
   ```javascript
   const supabaseUrl = 'YOUR_SUPABASE_URL';
   const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
   ```

4. **Run the app**
   ```bash
   npm start
   # or
   npx expo start
   ```

## 📱 Project Structure

```
BeeGrubApp/
├── src/
│   ├── components/
│   │   └── common/          # Reusable UI components
│   ├── constants/
│   │   ├── colors.js        # Color definitions
│   │   └── theme.js         # Theme constants
│   ├── navigation/
│   │   └── AppNavigator.js  # Navigation setup
│   ├── screens/
│   │   ├── auth/           # Authentication screens
│   │   ├── student/        # Student app screens
│   │   └── vendor/         # Vendor app screens (to be added)
│   ├── services/
│   │   ├── api.js          # API service functions
│   │   └── supabase.js     # Supabase configuration
│   └── utils/
│       └── helpers.js      # Utility functions
├── assets/                 # Images, fonts, etc.
├── App.js                 # Main app component
└── package.json
```

## 🎨 Key Features

### Authentication
- Student registration with BINUS email validation
- Vendor registration with admin approval
- Secure login/logout

### Student Features
- Browse available canteens
- View menu items
- Add items to cart
- Select pickup location and time
- Place orders
- View order history

### Vendor Features (Coming Soon)
- Manage menu items
- View incoming orders
- Update order status
- Dashboard analytics

## 🛠 Tech Stack

- **Frontend**: React Native + Expo
- **Backend**: Supabase (PostgreSQL database)
- **Authentication**: Supabase Auth
- **Navigation**: React Navigation
- **State Management**: React Hooks

## 🎯 Core Screens

1. **Startup Screen** - App intro with auto-navigation
2. **Login Choice** - Select user type (Student/Vendor)
3. **Login Screen** - Email/password authentication
4. **Register Choice** - Registration type selection
5. **Register Screen** - User registration form
6. **Student Home** - Browse available canteens
7. **Menu Screen** - View menu items and add to cart
8. **Checkout Screen** - Order summary and placement
9. **Orders Screen** - View order history

## 🗄 Database Schema (Supabase)

### Tables to create in Supabase:

```sql
-- Students table
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  student_id TEXT UNIQUE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vendors table
CREATE TABLE vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  canteen_name TEXT,
  canteen_location TEXT,
  owner_name TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP DEFAULT NOW()
);

-- Menu Items table
CREATE TABLE menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id),
  name TEXT,
  description TEXT,
  price DECIMAL,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id),
  vendor_id UUID REFERENCES vendors(id),
  pickup_location TEXT,
  pickup_time TEXT,
  notes TEXT,
  total_amount DECIMAL,
  status TEXT DEFAULT 'pending', -- pending, confirmed, preparing, ready, completed, cancelled
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order Items table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER,
  price DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🎨 Design System

### Colors
- Primary: `#f1ead1` (Cream background)
- Text: `#000000` (Black)
- Text Secondary: `#363434` (Dark gray)
- Success: `#4CAF50` (Green)
- Error: `#F44336` (Red)
- Info: `#2196F3` (Blue)

### Typography
- Extra Large: 64px (App title)
- Large: 32px (Screen titles)
- Medium: 18px (Body text)
- Regular: 16px (Regular text)
- Small: 14px (Labels)

## 📝 Development Notes

### Converting from Figma/CSS to React Native

When converting your Figma designs:

1. **Replace HTML elements**:
   - `div` → `View`
   - `p`, `span` → `Text`
   - `input` → `TextInput`
   - `button` → `TouchableOpacity`

2. **Convert CSS to StyleSheet**:
   ```css
   /* CSS */
   .container {
     background-color: #f1ead1;
     padding: 20px;
   }
   ```
   ```javascript
   // React Native
   const styles = StyleSheet.create({
     container: {
       backgroundColor: '#f1ead1',
       padding: 20,
     }
   });
   ```

3. **Layout differences**:
   - All layouts use Flexbox by default
   - No `margin: auto` - use `alignItems: 'center'`
   - No `position: absolute` without parent having `position: relative`

## 🚧 Next Steps

1. **Set up Supabase database** with the provided schema
2. **Add sample data** for testing
3. **Implement vendor screens**
4. **Add push notifications**
5. **Implement payment integration**
6. **Add image upload for menu items**
7. **Create admin panel**

## 🐛 Common Issues

1. **Metro bundler issues**: Clear cache with `npx expo start -c`
2. **Navigation errors**: Make sure all screen names match
3. **Supabase connection**: Verify your URL and keys are correct
4. **Authentication issues**: Check if email confirmation is required

## 📞 Support

For questions or issues, refer to:
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Navigation Documentation](https://reactnavigation.org/)

---

**Happy coding! 🐝🍯**