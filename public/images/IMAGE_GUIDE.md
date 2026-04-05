# Image Management Guide

This folder contains all static images for the Bawarchi Restaurant Ordering System.

## Folder Structure

```
public/images/
├── dishes/          (Menu item images)
├── logos/           (Logo, icons, branding)
├── banners/         (Promotional banners)
└── hero/            (Hero section images)
```

## How to Use Images

### 1. Upload Images
Simply place your image files in the appropriate subfolder:
- `dishes/` → Menu item photos (e.g., pizza.jpg, biryani.jpg)
- `logos/` → Brand logos (e.g., bawarchi-logo.png)
- `banners/` → Promotional banners (e.g., first-order-banner.jpg)
- `hero/` → Hero section images (e.g., hero-main.jpg)

### 2. Reference in JSX Code

#### Method 1: Direct src Path (Simplest)
```jsx
<img src="/images/dishes/pizza.jpg" alt="Pizza" />
<img src="/images/logos/bawarchi-logo.png" alt="Bawarchi Logo" />
```

#### Method 2: Using Variables
```jsx
const dishImage = "/images/dishes/biryani.jpg";

<img src={dishImage} alt="Biryani" />
```

#### Method 3: Fallback on Error
```jsx
<img 
  src="/images/dishes/pizza.jpg" 
  alt="Pizza"
  onError={(e) => {
    e.target.src = "/images/dishes/placeholder.jpg";
  }}
/>
```

### 3. Current Implementation in App

The app already uses these paths in several places:
- `Home.js` - Hero section images
- `Menu.js` - Menu item cards
- `ProductDetail.js` - Product detail images
- `Navbar.js` - Logo

### 4. Benefits
✅ No external dependencies (no Pexels API)
✅ Faster loading (local images)
✅ Full control over content
✅ Easy to manage and update
✅ No CORS issues
✅ Can version control with git-lfs if needed

### 5. Image Recommendations

**Dish Images:**
- Format: JPG or PNG
- Size: 400x300px (optimal for cards)
- Quality: High (compressed but clear)

**Hero Images:**
- Format: JPG
- Size: 600x400px
- Quality: High (background images)

**Logo:**
- Format: PNG (with transparency)
- Size: 150x50px
- Quality: Vector quality

**Banners:**
- Format: JPG
- Size: 1200x400px
- Quality: High

## Example Paths

```
/images/dishes/pizza.jpg
/images/dishes/biryani.jpg
/images/dishes/curry.jpg
/images/logos/bawarchi-logo.png
/images/banners/first-order-discount.jpg
/images/hero/hero-main.jpg
```

## Tips

1. Keep image names lowercase and use hyphens (not spaces)
2. Compress images before uploading to reduce bundle size
3. Use descriptive names (e.g., `garlic-naan.jpg` not `img1.jpg`)
4. Keep similar images in the same subfolder
5. Update image paths in your database or code when changing filenames

---

Now you can easily manage all images from the `/images` folder without worrying about external URLs or CORS issues!
