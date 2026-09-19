using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace DndSessionManager.Api.Data;

// Keeps EF tooling independent of the web host (which applies migrations on startup).
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>();
        options.UseNpgsql("Host=localhost;Port=5433;Database=dndsessionmanager;Username=postgres;Password=postgres");
        return new AppDbContext(options.Options);
    }
}
