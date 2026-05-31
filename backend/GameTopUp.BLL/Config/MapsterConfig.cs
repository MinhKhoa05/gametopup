using Mapster;
using System;

namespace GameTopUp.BLL.Config
{
    public static class MapsterConfig
    {
        public static void RegisterMappings()
        {
            TypeAdapterConfig.GlobalSettings.Default.IgnoreNullValues(true);

            TypeAdapterConfig<Enum, string>.NewConfig()
                .MapWith(src => src.ToString());
        }
    }
}
