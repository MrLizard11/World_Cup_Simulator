using Microsoft.EntityFrameworkCore;
using WorldCupSimulator.Api.Models;

namespace WorldCupSimulator.Api.Data;

public class WorldCupContext : DbContext
{
    public WorldCupContext(DbContextOptions<WorldCupContext> options) : base(options)
    {
    }

    public DbSet<Team> Teams { get; set; } = null!;
    public DbSet<Group> Groups { get; set; } = null!;
    public DbSet<Match> Matches { get; set; } = null!;
    public DbSet<GroupTeam> GroupTeams { get; set; } = null!;
    public DbSet<KnockoutMatch> KnockoutMatches { get; set; } = null!;
    public DbSet<KnockoutStage> KnockoutStages { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure GroupTeam as join entity
        modelBuilder.Entity<GroupTeam>()
            .HasKey(gt => new { gt.GroupId, gt.TeamId });

        modelBuilder.Entity<GroupTeam>()
            .HasOne(gt => gt.Group)
            .WithMany(g => g.Teams)
            .HasForeignKey(gt => gt.GroupId);

        modelBuilder.Entity<GroupTeam>()
            .HasOne(gt => gt.Team)
            .WithMany(t => t.GroupTeams)
            .HasForeignKey(gt => gt.TeamId);

        // Configure Match relationships
        // Configure Match inheritance
        modelBuilder.Entity<Match>()
            .HasDiscriminator<string>("MatchType")
            .HasValue<GroupMatch>("Group")
            .HasValue<KnockoutMatch>("Knockout");

        // Configure common Match relationships
        modelBuilder.Entity<Match>()
            .HasOne(m => m.TeamA)
            .WithMany()
            .HasForeignKey(m => m.TeamAId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Match>()
            .HasOne(m => m.TeamB)
            .WithMany()
            .HasForeignKey(m => m.TeamBId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure Group Match relationships
        modelBuilder.Entity<GroupMatch>()
            .HasOne(m => m.Group)
            .WithMany(g => g.Matches)
            .HasForeignKey(m => m.GroupId);

        // Configure KnockoutMatch relationships
        modelBuilder.Entity<KnockoutMatch>()
            .HasOne(m => m.RoundOf16Stage)
            .WithMany(s => s.RoundOf16)
            .HasForeignKey("RoundOf16StageId")
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<KnockoutMatch>()
            .HasOne(m => m.QuarterFinalsStage)
            .WithMany(s => s.QuarterFinals)
            .HasForeignKey("QuarterFinalsStageId")
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<KnockoutMatch>()
            .HasOne(m => m.SemiFinalsStage)
            .WithMany(s => s.SemiFinals)
            .HasForeignKey("SemiFinalsStageId")
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<KnockoutStage>()
            .HasOne(ks => ks.ThirdPlaceMatch)
            .WithOne(m => m.ThirdPlaceStage)
            .HasForeignKey<KnockoutMatch>("ThirdPlaceStageId")
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<KnockoutStage>()
            .HasOne(ks => ks.Final)
            .WithOne(m => m.FinalStage)
            .HasForeignKey<KnockoutMatch>("FinalStageId")
            .OnDelete(DeleteBehavior.Restrict);
    }
}
