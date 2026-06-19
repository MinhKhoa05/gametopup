using Mapster;

namespace GameTopUp.BLL.Mappers;

public static class MappingExtensions
{
    public static TDestination MapTo<TDestination>(this object source)
    {
        return source.Adapt<TDestination>(BackendMapsterConfig.Config);
    }
}
