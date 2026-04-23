using LittleGeniusLab.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace LittleGeniusLab.Api.Data;

public static class SeedData
{
    public static async Task InitializeAsync(AppDbContext db)
    {
        if (await db.Categories.AnyAsync())
        {
            return;
        }

        var passwordHasher = new PasswordHasher<AppUser>();

        var adminUser = new AppUser
        {
            FullName = "LittleGenius Admin",
            Email = "admin@littlegeniuslab.in",
            Phone = "9876543210",
            Role = AppRoles.Admin,
        };
        adminUser.PasswordHash = passwordHasher.HashPassword(adminUser, "Admin@12345");

        var customerUser = new AppUser
        {
            FullName = "Priya Raman",
            Email = "priya@example.com",
            Phone = "9123456780",
            Role = AppRoles.Customer,
        };
        customerUser.PasswordHash = passwordHasher.HashPassword(customerUser, "Customer@123");

        var categories = new List<ProductCategory>
        {
            new()
            {
                Name = "Animal Kingdom",
                Slug = "animals",
                Description = "Chubby proportions, rounded edges, and pastel finishes tiny hands love.",
                PriceRange = "Rs. 300-500",
                ThemeColor = "#F5C400",
                ImageUrl = "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80",
                SortOrder = 1
            },
            new()
            {
                Name = "Robot Crew",
                Slug = "robots",
                Description = "Friendly robot sidekicks with storybook colour blocking and zero sharp edges.",
                PriceRange = "Rs. 400-700",
                ThemeColor = "#1A3C6E",
                ImageUrl = "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80",
                SortOrder = 2
            },
            new()
            {
                Name = "Chibi Squad",
                Slug = "chibi",
                Description = "Big heads, tiny bodies, and oversized expressions that turn desks into happy corners.",
                PriceRange = "Rs. 500-900",
                ThemeColor = "#E05C1A",
                ImageUrl = "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
                SortOrder = 3
            },
            new()
            {
                Name = "Custom Toys",
                Slug = "custom",
                Description = "One-of-a-kind figurines crafted from your child, pet, or favourite character photo.",
                PriceRange = "From Rs. 800",
                ThemeColor = "#E05C1A",
                ImageUrl = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
                SortOrder = 4
            }
        };

        var products = new List<Product>
        {
            new()
            {
                Category = categories[0],
                Name = "Chubby Elephant - Pastel Pink Edition",
                Slug = "chubby-elephant-pastel-pink",
                Sku = "LGL-ANI-001",
                ShortDescription = "A round, squishy-looking elephant toy with big ears and a gentle smile.",
                FullDescription = "Meet your new little friend. This chubby 3D printed elephant is designed to be everything a toy should be - soft-looking, colourful, and impossible to put down. Printed in child-safe PLA plastic with smooth pastel colours, it sits perfectly on any shelf, desk, or in a little pair of hands.",
                PriceInr = 400,
                Badge = "Bestseller",
                HeroImageUrl = categories[0].ImageUrl,
                SizeMm = 100,
                Colourway = "Pastel pink with soft grey accents",
                Material = "Child-safe PLA",
                Finish = "Smooth matte surface",
                ShipsIn = "2 business days",
                Tagline = "Your child's new best friend.",
                IsFeatured = true,
                StockQuantity = 14,
                DisplayOrder = 1
            },
            new()
            {
                Category = categories[0],
                Name = "Gentle Giraffe - Sunbeam Yellow",
                Slug = "gentle-giraffe-sunbeam-yellow",
                Sku = "LGL-ANI-002",
                ShortDescription = "A calm little giraffe with rounded spots and a shelf-friendly silhouette.",
                FullDescription = "Gentle Giraffe brings a playful safari mood to bedtime shelves and play corners. Its rounded lines and warm colour palette make it feel familiar and giftable from the first glance.",
                PriceInr = 450,
                Badge = "Great Gift",
                HeroImageUrl = "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=900&q=80",
                SizeMm = 120,
                Colourway = "Sunbeam yellow with caramel spots",
                Material = "Child-safe PLA",
                Finish = "Soft matte finish",
                ShipsIn = "2 business days",
                Tagline = "A safari friend for every tiny explorer.",
                StockQuantity = 9,
                DisplayOrder = 2
            },
            new()
            {
                Category = categories[1],
                Name = "Captain Bolt - Cartoon Robot Toy",
                Slug = "captain-bolt-cartoon-robot",
                Sku = "LGL-ROB-001",
                ShortDescription = "A cheerful little robot with big eyes and bright colours.",
                FullDescription = "Every great story needs a robot sidekick - and Captain Bolt is ready to be yours. This friendly 3D printed robot toy is designed in a rounded cartoon style with a big expressive face, bold colour blocking, and zero sharp edges.",
                PriceInr = 550,
                Badge = "New Arrival",
                HeroImageUrl = categories[1].ImageUrl,
                SizeMm = 120,
                Colourway = "Teal, mustard, and cream",
                Material = "Child-safe PLA",
                Finish = "Smooth matte surface",
                ShipsIn = "2 business days",
                Tagline = "Built for adventures, designed for smiles.",
                IsFeatured = true,
                StockQuantity = 12,
                DisplayOrder = 3
            },
            new()
            {
                Category = categories[1],
                Name = "Nova Rover - Storybook Bot",
                Slug = "nova-rover-storybook-bot",
                Sku = "LGL-ROB-002",
                ShortDescription = "A curious robot explorer with a bold visor and friendly stance.",
                FullDescription = "Nova Rover brings instant mission energy to a room. It is bright, balanced, and designed to feel sturdy enough for repeat play while still looking delightful on a study desk.",
                PriceInr = 620,
                Badge = "Low Stock",
                HeroImageUrl = "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=900&q=80",
                SizeMm = 140,
                Colourway = "Coral, navy, and cloud white",
                Material = "Child-safe PLA",
                Finish = "Smooth matte surface",
                ShipsIn = "3 business days",
                Tagline = "A storybook sidekick for every mission.",
                StockQuantity = 4,
                DisplayOrder = 4
            },
            new()
            {
                Category = categories[2],
                Name = "Chibi Friend - Custom Character Figurine",
                Slug = "chibi-friend-custom-character",
                Sku = "LGL-CHI-001",
                ShortDescription = "A cute, big-headed chibi figurine with a personality that's impossible not to love.",
                FullDescription = "There's something irresistible about chibi style - those big heads, tiny bodies, and oversized expressions that make everything look ten times cuter. This figurine brings that energy to life in 3D printed form, with a smooth matte finish and a personality that's all your own.",
                PriceInr = 700,
                Badge = "Great Gift",
                HeroImageUrl = categories[2].ImageUrl,
                SizeMm = 150,
                Colourway = "Peach, cream, and pastel blue",
                Material = "Child-safe PLA",
                Finish = "Smooth matte surface",
                ShipsIn = "2 business days",
                Tagline = "Big heads. Bigger smiles.",
                IsFeatured = true,
                StockQuantity = 8,
                DisplayOrder = 5
            },
            new()
            {
                Category = categories[2],
                Name = "Festival Chibi - Celebration Edition",
                Slug = "festival-chibi-celebration-edition",
                Sku = "LGL-CHI-002",
                ShortDescription = "A festive desk companion designed for birthdays, gifting, and joyful shelves.",
                FullDescription = "Festival Chibi leans into the giftable heart of the brand with bright accents, a celebratory base, and the same smooth finish parents expect from LittleGenius LAB.",
                PriceInr = 850,
                Badge = "Bestseller",
                HeroImageUrl = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
                SizeMm = 160,
                Colourway = "Confetti pink, cream, and mint",
                Material = "Child-safe PLA",
                Finish = "Smooth matte surface",
                ShipsIn = "3 business days",
                Tagline = "A joyful statement piece for gifting season.",
                IsFeatured = true,
                StockQuantity = 6,
                DisplayOrder = 6
            }
        };

        var reviews = new List<ProductReview>
        {
            new()
            {
                Product = products[0],
                CustomerName = "Priya M.",
                CustomerLocation = "Chennai",
                Rating = 5,
                Quote = "My daughter carries her elephant everywhere!",
                DisplayOrder = 1
            },
            new()
            {
                Product = products[2],
                CustomerName = "Rajan K.",
                CustomerLocation = "Bengaluru",
                Rating = 5,
                Quote = "Captain Bolt showed up beautifully packed and instantly became the hero of bedtime stories.",
                DisplayOrder = 2
            },
            new()
            {
                Product = products[4],
                CustomerName = "Deepa S.",
                CustomerLocation = "Coimbatore",
                Rating = 5,
                Quote = "The custom figurine looked adorable and the WhatsApp updates made the whole process feel trustworthy.",
                DisplayOrder = 3
            }
        };

        var address = new Address
        {
            User = customerUser,
            Label = "Home",
            RecipientName = customerUser.FullName,
            Phone = customerUser.Phone,
            Line1 = "12 Lake View Road",
            City = "Coimbatore",
            State = "Tamil Nadu",
            Pincode = "641001",
            IsDefault = true
        };

        var sampleOrder = new Order
        {
            User = customerUser,
            OrderCode = "LGL-ORD-10001",
            CustomerName = customerUser.FullName,
            Email = customerUser.Email,
            Phone = customerUser.Phone,
            Line1 = address.Line1,
            City = address.City,
            State = address.State,
            Pincode = address.Pincode,
            PaymentMethod = "Cash on Delivery",
            PaymentStatus = PaymentStatuses.Pending,
            Status = OrderStatuses.Printing,
            SubtotalInr = 950,
            ShippingFeeInr = 0,
            TotalPriceInr = 950
        };

        sampleOrder.Items.Add(new OrderItem
        {
            Product = products[0],
            ProductName = products[0].Name,
            ProductSlug = products[0].Slug,
            Quantity = 1,
            UnitPriceInr = products[0].PriceInr,
            TotalPriceInr = products[0].PriceInr
        });
        sampleOrder.Items.Add(new OrderItem
        {
            Product = products[2],
            ProductName = products[2].Name,
            ProductSlug = products[2].Slug,
            Quantity = 1,
            UnitPriceInr = products[2].PriceInr,
            TotalPriceInr = products[2].PriceInr
        });

        var deliveredOrder = new Order
        {
            User = customerUser,
            OrderCode = "LGL-ORD-10002",
            CustomerName = customerUser.FullName,
            Email = customerUser.Email,
            Phone = customerUser.Phone,
            Line1 = address.Line1,
            City = address.City,
            State = address.State,
            Pincode = address.Pincode,
            PaymentMethod = "Razorpay",
            PaymentStatus = PaymentStatuses.Paid,
            Status = OrderStatuses.Delivered,
            SubtotalInr = 400,
            ShippingFeeInr = 0,
            TotalPriceInr = 400,
            CreatedAtUtc = DateTime.UtcNow.AddDays(-8),
            UpdatedAtUtc = DateTime.UtcNow.AddDays(-2)
        };

        deliveredOrder.Items.Add(new OrderItem
        {
            Product = products[0],
            ProductName = products[0].Name,
            ProductSlug = products[0].Slug,
            Quantity = 1,
            UnitPriceInr = products[0].PriceInr,
            TotalPriceInr = products[0].PriceInr
        });

        var customOrder = new CustomOrderRequest
        {
            User = customerUser,
            ReferenceCode = "LGL-4001",
            Name = customerUser.FullName,
            Email = customerUser.Email,
            WhatsAppNumber = customerUser.Phone,
            Occasion = "Birthday Gift",
            Size = "Medium",
            ColorPreference = "Pastel blue",
            CharacterDescription = "A smiling girl with braids, a yellow frock, and holding a rabbit.",
            PhotoUrl = "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
            Pincode = address.Pincode,
            Status = CustomOrderStatuses.Quoted,
            QuoteAmountInr = 1200,
            AdminNotes = "Render shared on WhatsApp. Awaiting approval."
        };

        var stockAdjustments = products.Select(product => new InventoryAdjustment
        {
            Product = product,
            QuantityChange = product.StockQuantity,
            Reason = "Initial stock",
            Notes = "Seeded opening inventory"
        });

        db.Users.AddRange(adminUser, customerUser);
        db.Categories.AddRange(categories);
        db.Products.AddRange(products);
        db.Reviews.AddRange(reviews);
        db.Addresses.Add(address);
        db.Orders.Add(sampleOrder);
        db.Orders.Add(deliveredOrder);
        db.CustomOrderRequests.Add(customOrder);
        db.InventoryAdjustments.AddRange(stockAdjustments);

        await db.SaveChangesAsync();
    }
}
