namespace LittleGeniusLab.Api.Configuration;

public sealed class AdminOptions
{
    public const string SectionName = "Admin";

    /// <summary>Optional: user id that cannot be deleted, demoted, or deactivated.</summary>
    public int? SuperAdminUserId { get; set; }
}
