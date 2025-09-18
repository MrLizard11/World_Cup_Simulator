namespace WorldCupSimulator.Api.DTOs;

public class BulkCreateTeamsRequest
{
    public List<CreateTeamRequest> Teams { get; set; } = new();
}