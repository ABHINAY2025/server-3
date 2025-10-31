import React, { CSSProperties } from 'react';
import {
  CheckCircle,
  Warning,
  Refresh,
  Circle,
} from '@mui/icons-material';

type StatusType = 'success' | 'warning' | 'error' | 'loading' | 'online';

type StatusIconProps = {
  type: StatusType;
  size?: 'small' | 'medium' | 'large' | 'xlarge' | string;
  color?: string;
  style?: CSSProperties;
};

// A unified icon component to replace emojis with MUI icons
// This handles consistent styling and accessibility
export const StatusIcon: React.FC<StatusIconProps> = ({
  type,
  size = 'medium',
  color,
  style = {},
}) => {
  // Map icon types to components and default colors
  const iconConfig: Record<
    StatusType,
    {
      component: React.ElementType;
      defaultColor: string;
      className?: string;
    }
  > = {
    success: {
      component: CheckCircle,
      defaultColor: '#2e7d32', // green
    },
    warning: {
      component: Warning,
      defaultColor: '#f57c00', // amber
    },
    error: {
      component: Warning,
      defaultColor: '#c62828', // red
    },
    loading: {
      component: Refresh,
      defaultColor: '#1976d2', // blue
      className: 'rotating-icon',
    },
    online: {
      component: Circle,
      defaultColor: '#2e7d32', // green
    },
  };

  // Get configuration for the requested icon type
  const config = iconConfig[type] || iconConfig.warning;
  const IconComponent = config.component;

  // Size mapping
  const sizeMap: Record<string, string> = {
    small: '16px',
    medium: '24px',
    large: '32px',
    xlarge: '48px',
  };

  const iconSize = sizeMap[size] || size;

  const combinedStyle: CSSProperties = {
    color: color || config.defaultColor,
    width: iconSize,
    height: iconSize,
    ...style,
  };

  return <IconComponent style={combinedStyle} className={config.className} />;
};

// Inject CSS animation for rotating icons (only in browser)
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('rotating-icon-style');
  if (!existingStyle) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'rotating-icon-style';
    styleSheet.textContent = `
      @keyframes rotating {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .rotating-icon {
        animation: rotating 1.5s linear infinite;
      }
    `;
    document.head.appendChild(styleSheet);
  }
}

export default StatusIcon;
