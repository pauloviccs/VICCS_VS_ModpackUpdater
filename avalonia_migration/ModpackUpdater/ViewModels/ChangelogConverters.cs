using Avalonia.Data.Converters;
using System;
using System.Globalization;

namespace ModpackUpdater.ViewModels;

public class ExpandedHeightConverter : IValueConverter
{
    public double CollapsedHeight { get; set; } = 100;
    public double ExpandedHeight { get; set; } = 300;

    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is bool isExpanded)
        {
            return isExpanded ? ExpandedHeight : CollapsedHeight;
        }
        return CollapsedHeight;
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        throw new NotImplementedException();
    }
}

public class ExpandHintConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is bool isExpanded)
        {
            return isExpanded ? "▲ Clique para recolher" : "▼ Clique para expandir";
        }
        return "▼ Clique para expandir";
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        throw new NotImplementedException();
    }
}
