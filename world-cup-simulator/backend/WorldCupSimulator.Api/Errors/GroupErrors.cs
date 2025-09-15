using WorldCupSimulator.Api.Common;

namespace WorldCupSimulator.Api.Errors;

public static class GroupErrors
{
    public static Error NotFound(int id) => new(
        "Groups.NotFound", $"The group with ID '{id}' was not found");

    public static readonly Error InvalidName = new(
        "Groups.InvalidName", "Group name cannot be empty");

    public static Error TeamsNotFound(IEnumerable<int> missingIds) => new(
        "Groups.TeamsNotFound", $"Teams not found: {string.Join(", ", missingIds)}");

    public static Error TeamsAlreadyInGroup(IEnumerable<int> existingIds) => new(
        "Groups.TeamsAlreadyInGroup", $"Teams with IDs {string.Join(", ", existingIds)} are already in this group");
}