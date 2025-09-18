using WorldCupSimulator.Api.Common;

namespace WorldCupSimulator.Api.Errors;

public static class MatchErrors
{
    public static Error NotFound(int id) => new(
        "Matches.NotFound", $"The match with ID '{id}' was not found");

    public static readonly Error SameTeam = new(
        "Matches.SameTeam", "A team cannot play against itself");

    public static Error AlreadyPlayed(int id) => new(
        "Matches.AlreadyPlayed", $"The match with ID '{id}' has already been played");

    public static readonly Error InvalidScore = new(
        "Matches.InvalidScore", "Match scores cannot be negative");
}