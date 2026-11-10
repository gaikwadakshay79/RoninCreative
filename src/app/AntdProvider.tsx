import '@ant-design/v5-patch-for-react-19';
import { StyleProvider } from '@ant-design/cssinjs';
import { App as AntdApp, ConfigProvider } from 'antd';
import type { ReactNode } from 'react';
import { antdThemeConfig } from '@/config/theme';

/**
 * Wraps any part of the site that uses Ant Design components.
 *
 * - ConfigProvider maps Ant Design's tokens to the Vantage design system.
 * - StyleProvider puts Ant Design's CSS in the `antd` cascade layer, below
 *   the site's own components and Tailwind utilities, so the two never fight.
 * - AntdApp provides the notification API through `App.useApp()`.
 */
export function AntdProvider({ children }: { children: ReactNode }) {
  return (
    <StyleProvider layer>
      <ConfigProvider theme={antdThemeConfig}>
        <AntdApp component={false} notification={{ placement: 'bottomRight', duration: 6 }}>
          {children}
        </AntdApp>
      </ConfigProvider>
    </StyleProvider>
  );
}
