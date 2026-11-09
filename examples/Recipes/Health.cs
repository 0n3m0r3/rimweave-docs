using RimWeave.Contributions;
using RimWeave.Health;
using Verse;

namespace RimWeave.Documentation.Examples;

// These native recipes are compiled but are not invoked by the standalone checks.
internal static class HealthRecipes
{
    #region attach
    internal static ContributionHediff Attach(
        Pawn pawn, HediffDef definition, BodyPartRecord part,
        ContributionId identity, ContributionOrigin origin)
    {
        var nativeEffect = HediffMaker.MakeHediff(definition, pawn, part);
        if (nativeEffect is not ContributionHediff effect)
            throw new InvalidOperationException("The definition must use ContributionHediff.");

        effect.Metadata.AssignIdentity(identity);
        effect.Metadata.DescribeOrigin(origin);
        pawn.health.AddHediff(effect, part);
        return effect;
    }
    #endregion

    #region query
    internal static ContributionLookupResult<ContributionHediff> FindOnPart(
        Pawn pawn, ContributionId identity, BodyPartRecord part)
    {
        return ContributionQueries.Resolve(pawn, identity, part);
    }
    #endregion

    #region remove-instance
    internal static HediffRemovalResult RemoveInstance(Pawn pawn, Hediff effect)
    {
        return HediffOperations.Remove(pawn, effect);
    }
    #endregion

    #region remove-identity
    internal static string RemoveByIdentity(
        Pawn pawn, ContributionId identity, BodyPartRecord? part)
    {
        var result = ContributionOperations.Remove(pawn, identity, part);
        if (result.Removal is null)
            return $"No removal requested: lookup={result.Lookup.Status}";

        return $"Guarded removal outcome: {result.Removal.Status}";
    }
    #endregion
}
