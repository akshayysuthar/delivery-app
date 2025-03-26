export const categoryImages = {
  "fruits-vegetables":
    "/placeholder.svg?height=200&width=200&text=Fruits+%26+Vegetables",
  "dairy-breakfast":
    "/placeholder.svg?height=200&width=200&text=Dairy+%26+Breakfast",
  "snacks-beverages":
    "/placeholder.svg?height=200&width=200&text=Snacks+%26+Beverages",
  "staples-cooking":
    "/placeholder.svg?height=200&width=200&text=Staples+%26+Cooking",
  "household-cleaning":
    "/placeholder.svg?height=200&width=200&text=Household+%26+Cleaning",
  "personal-care": "/placeholder.svg?height=200&width=200&text=Personal+Care",
  "baby-care": "/placeholder.svg?height=200&width=200&text=Baby+Care",
  "meat-seafood": "/placeholder.svg?height=200&width=200&text=Meat+%26+Seafood",
};

export const productImages = {
  apples: "/placeholder.svg?height=300&width=300&text=Apples",
  bread: "/placeholder.svg?height=300&width=300&text=Bread",
  eggs: "/placeholder.svg?height=300&width=300&text=Eggs",
  butter: "/placeholder.svg?height=300&width=300&text=Butter",
  salt: "/placeholder.svg?height=300&width=300&text=Salt",
  maggi: "/placeholder.svg?height=300&width=300&text=Maggi",
  atta: "/placeholder.svg?height=300&width=300&text=Atta",
  detergent: "/placeholder.svg?height=300&width=300&text=Detergent",
  tomatoes: "/placeholder.svg?height=300&width=300&text=Tomatoes",
  onions: "/placeholder.svg?height=300&width=300&text=Onions",
  potatoes: "/placeholder.svg?height=300&width=300&text=Potatoes",
  bananas: "/placeholder.svg?height=300&width=300&text=Bananas",
  coke: "/placeholder.svg?height=300&width=300&text=Coca-Cola",
  chips: "/placeholder.svg?height=300&width=300&text=Chips",
  soap: "/placeholder.svg?height=300&width=300&text=Soap",
  toothpaste: "/placeholder.svg?height=300&width=300&text=Toothpaste",
  diapers: "/placeholder.svg?height=300&width=300&text=Diapers",
  chicken: "/placeholder.svg?height=300&width=300&text=Chicken",
  prawns: "/placeholder.svg?height=300&width=300&text=Prawns",
  "toilet-cleaner": "/placeholder.svg?height=300&width=300&text=Toilet+Cleaner",
};

export function getProductImageUrl(imagePath: string): string {
  return imagePath || "/placeholder.svg?height=300&width=300&text=Product";
}

export function getCategoryImageUrl(imagePath: string, slug: string): string {
  if (imagePath.startsWith("/images/categories/")) {
    return (
      categoryImages[slug as keyof typeof categoryImages] ||
      "/placeholder.svg?height=200&width=200&text=Category"
    );
  }
  return imagePath || "/placeholder.svg?height=200&width=200&text=Category";
}
