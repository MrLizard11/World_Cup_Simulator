namespace WorldCupSimulator.Api.DTOs;

public class BulkCreateGroupsRequest
{
    public List<string> GroupNames { get; set; } = new() { "A", "B", "C", "D", "E", "F", "G", "H" };
}