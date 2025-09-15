using WorldCupSimulator.Api.Common;

namespace WorldCupSimulator.Api.Errors;

public static class TeamErrors
{
    public static Error NotFound(int id) => new(
        "Teams.NotFound", $"The team with ID '{id}' was not found");

    public static readonly Error InvalidName = new(
        "Teams.InvalidName", "Team name cannot be empty");

    public static readonly Error DuplicateName = new(
        "Teams.DuplicateName", "A team with this name already exists");
}