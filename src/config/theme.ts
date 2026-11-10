import { theme as antdTheme, type ThemeConfig } from 'antd';

/**
 * Ant Design reads colours as hex, so these are the Vantage tokens of
 * src/styles/globals.css converted from OKLCH. Change a colour there first,
 * then mirror it here.
 */
export const vantage = {
  paper: '#04090c',
  paper2: '#091015',
  paper3: '#111a1f',
  ink: '#ebeff2',
  ink2: '#bdc6ca',
  muted: '#89949a',
  rule: '#20282c',
  rule2: '#30393f',
  field: '#636c71',
  accent: '#bcf053',
  accentHi: '#ccfc76',
  accentInk: '#0f1703',
  error: '#f47c70',
  success: '#6fc884',
} as const;

const fontFamily = '"Geologica Variable", "Geologica", ui-sans-serif, system-ui, sans-serif';

export const antdThemeConfig: ThemeConfig = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    colorPrimary: vantage.accent,
    colorInfo: vantage.accent,
    colorSuccess: vantage.success,
    colorError: vantage.error,
    colorTextBase: vantage.ink,
    colorBgBase: vantage.paper,
    colorText: vantage.ink,
    colorTextSecondary: vantage.ink2,
    colorTextTertiary: vantage.muted,
    colorTextPlaceholder: vantage.muted,
    colorBgContainer: vantage.paper2,
    colorBgElevated: vantage.paper2,
    colorBgLayout: vantage.paper,
    colorBorder: vantage.field,
    colorBorderSecondary: vantage.rule,
    colorSplit: vantage.rule,
    fontFamily,
    fontSize: 16,
    borderRadius: 4,
    borderRadiusLG: 4,
    borderRadiusSM: 4,
    controlHeight: 44,
    controlHeightLG: 52,
    wireframe: false,
    motionDurationMid: '0.22s',
    motionDurationSlow: '0.42s',
    boxShadow: 'none',
    boxShadowSecondary: 'none',
  },
  components: {
    Form: { labelColor: vantage.ink, itemMarginBottom: 20, verticalLabelPadding: '0 0 8px' },
    Input: {
      activeShadow: 'none',
      errorActiveShadow: 'none',
      hoverBorderColor: vantage.ink2,
      activeBorderColor: vantage.accent,
      paddingInlineLG: 16,
    },
    Select: {
      activeOutlineColor: 'transparent',
      hoverBorderColor: vantage.ink2,
      activeBorderColor: vantage.accent,
      optionSelectedBg: vantage.paper3,
      optionActiveBg: vantage.paper3,
      optionSelectedColor: vantage.ink,
    },
    Drawer: { colorBgElevated: vantage.paper, colorBgMask: 'rgba(4, 9, 12, 0.72)' },
    Skeleton: { gradientFromColor: vantage.paper2, gradientToColor: vantage.paper3 },
    Notification: { colorBgElevated: vantage.paper2 },
  },
};
