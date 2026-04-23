namespace LittleGeniusLab.Api.Models;

public static class AppRoles
{
    public const string Admin = "Admin";
    public const string Customer = "Customer";
}

public static class OrderStatuses
{
    public const string Pending = "Pending";
    public const string Printing = "Printing";
    public const string Shipped = "Shipped";
    public const string Delivered = "Delivered";
    public const string Cancelled = "Cancelled";
}

public static class PaymentStatuses
{
    public const string Pending = "Pending";
    public const string Paid = "Paid";
    public const string Failed = "Failed";
    public const string Refunded = "Refunded";
}

public static class CustomOrderStatuses
{
    public const string New = "New";
    public const string Reviewing = "Reviewing";
    public const string Quoted = "Quoted";
    public const string Approved = "Approved";
    public const string Printing = "Printing";
    public const string Delivered = "Delivered";
}
