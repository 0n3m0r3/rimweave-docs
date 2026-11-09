using RimWeave.Contributions;

namespace RimWeave.Documentation.Examples;

#region contribution
internal sealed class ProtectionContribution : IContribution
{
    public ContributionMetadata Metadata { get; } = new();
}
#endregion

internal static class ContributionRecipes
{
    #region custom-type
    internal static readonly ContributionOriginType Impact =
        new("example.combat", "impact");
    #endregion

    #region origin
    internal static ProtectionContribution DescribeEquipment()
    {
        var contribution = new ProtectionContribution();
        contribution.Metadata.AssignIdentity(
            new ContributionId("example.fieldgear", "glove-support"));
        contribution.Metadata.DescribeOrigin(new ContributionOrigin(
            new ContributionOriginType("example.equipment", "equipped"),
            "example.fieldgear:glove/42"));
        return contribution;
    }
    #endregion

    #region claims
    internal static ContributionLookupResult<ProtectionContribution> FindClaimants()
    {
        var glove = DescribeEquipment();
        var charm = new ProtectionContribution();
        charm.Metadata.AssignIdentity(new ContributionId("example.charm", "glove-support"));

        glove.Metadata.ClaimExclusiveResponsibility("example/protection-controller");
        charm.Metadata.ClaimExclusiveResponsibility("example/protection-controller");

        // This collection represents one target scope chosen by the provider.
        ProtectionContribution[] candidates = [glove, charm];
        return ContributionResolver.ResolveExclusiveClaim(
            candidates, "example/protection-controller");
    }
    #endregion
}
