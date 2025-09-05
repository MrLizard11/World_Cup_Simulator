using Microsoft.EntityFrameworkCore;

namespace WorldCupSimulator.Api.Data;

public static class DbInitializer
{
    public static void Initialize(WorldCupContext context)
    {
        // Clear existing data in the correct order
        context.Database.ExecuteSqlRaw("DELETE FROM Matches");
        context.Database.ExecuteSqlRaw("DELETE FROM GroupTeams");
        context.Database.ExecuteSqlRaw("DELETE FROM Teams");
        context.Database.ExecuteSqlRaw("DELETE FROM Groups");
        
        // Reset identity columns
        context.Database.ExecuteSqlRaw("DBCC CHECKIDENT ('Teams', RESEED, 0)");
        context.Database.ExecuteSqlRaw("DBCC CHECKIDENT ('Groups', RESEED, 0)");
        context.Database.ExecuteSqlRaw("DBCC CHECKIDENT ('Matches', RESEED, 0)");
        
        context.SaveChanges();

        // Reset identity column to start from 1
        context.Database.ExecuteSqlRaw("DBCC CHECKIDENT ('Teams', RESEED, 0)");

        var teams = new[]
        {
            new Models.Team { Name = "Brazil", Country = "Brazil", Elo = 2001, CountryCode = "BRA" },
            new Models.Team { Name = "Argentina", Country = "Argentina", Elo = 2131, CountryCode = "ARG" },
            new Models.Team { Name = "France", Country = "France", Elo = 2055, CountryCode = "FRA" },
            new Models.Team { Name = "Germany", Country = "Germany", Elo = 1913, CountryCode = "GER" },
            new Models.Team { Name = "Spain", Country = "Spain", Elo = 2156, CountryCode = "ESP" },
            new Models.Team { Name = "England", Country = "England", Elo = 1984, CountryCode = "ENG" },
            new Models.Team { Name = "Italy", Country = "Italy", Elo = 1881, CountryCode = "ITA" },
            new Models.Team { Name = "Netherlands", Country = "Netherlands", Elo = 1975, CountryCode = "NED" },
            new Models.Team { Name = "Portugal", Country = "Portugal", Elo = 2030, CountryCode = "POR" },
            new Models.Team { Name = "Belgium", Country = "Belgium", Elo = 1846, CountryCode = "BEL" },
            new Models.Team { Name = "Croatia", Country = "Croatia", Elo = 1926, CountryCode = "CRO" },
            new Models.Team { Name = "Uruguay", Country = "Uruguay", Elo = 1901, CountryCode = "URU" },
            new Models.Team { Name = "Mexico", Country = "Mexico", Elo = 1860, CountryCode = "MEX" },
            new Models.Team { Name = "Colombia", Country = "Colombia", Elo = 1951, CountryCode = "COL" },
            new Models.Team { Name = "Chile", Country = "Chile", Elo = 1688, CountryCode = "CHI" },
            new Models.Team { Name = "Peru", Country = "Peru", Elo = 1743, CountryCode = "PER" },
            new Models.Team { Name = "Ecuador", Country = "Ecuador", Elo = 1905, CountryCode = "ECU" },
            new Models.Team { Name = "Venezuela", Country = "Venezuela", Elo = 1745, CountryCode = "VEN" },
            new Models.Team { Name = "United States", Country = "United States", Elo = 1696, CountryCode = "USA" },
            new Models.Team { Name = "Canada", Country = "Canada", Elo = 1768, CountryCode = "CAN" },
            new Models.Team { Name = "Japan", Country = "Japan", Elo = 1800, CountryCode = "JPN" },
            new Models.Team { Name = "South Korea", Country = "South Korea", Elo = 1780, CountryCode = "KOR" },
            new Models.Team { Name = "Australia", Country = "Australia", Elo = 1740, CountryCode = "AUS" },
            new Models.Team { Name = "Saudi Arabia", Country = "Saudi Arabia", Elo = 1600, CountryCode = "KSA" },
            new Models.Team { Name = "Iran", Country = "Iran", Elo = 1650, CountryCode = "IRN" },
            new Models.Team { Name = "Qatar", Country = "Qatar", Elo = 1550, CountryCode = "QAT" },
            new Models.Team { Name = "Morocco", Country = "Morocco", Elo = 1850, CountryCode = "MAR" },
            new Models.Team { Name = "Tunisia", Country = "Tunisia", Elo = 1700, CountryCode = "TUN" },
            new Models.Team { Name = "Egypt", Country = "Egypt", Elo = 1680, CountryCode = "EGY" },
            new Models.Team { Name = "Ghana", Country = "Ghana", Elo = 1720, CountryCode = "GHA" },
            new Models.Team { Name = "Nigeria", Country = "Nigeria", Elo = 1750, CountryCode = "NGA" },
            new Models.Team { Name = "Senegal", Country = "Senegal", Elo = 1800, CountryCode = "SEN" }
        };

        context.Teams.AddRange(teams);
        context.SaveChanges();
    }
}
