import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { HTTPFlowBodyByIdRequest, HTTPHistorySourcePageType, HTTPPacketFuzzable } from '@/components/HTTPHistory'
import type { HTTPFlowDetailProp } from '@/components/HTTPFlowDetail'
import type { HTTPFlowTableProp } from '@/components/HTTPFlowTable/HTTPFlowTable'
import {
  createHTTPFlowBodyByIdRequest,
  createHTTPFlowDetailBridgeProps,
  createHTTPHistoryForwardProps,
  createHTTPPacketFuzzable,
  HTTPHistoryBridgeSnapshot,
} from '@/components/HTTPFlowTable/Vitest__Test__'

type HTTPFlowRuleDataFilterModule = typeof import('@/components/HTTPFlowTable/HTTPFlowRuleDataFilter')
type ConfigPrivateDomainModule = typeof import('@/components/ConfigPrivateDomain/ConfigPrivateDomain')

const historyForwardProps = createHTTPHistoryForwardProps() satisfies Partial<HTTPFlowTableProp>

describe('HTTPHistory to HTTPFlowTable contract', () => {
  it('keeps the HTTPHistory forwarded props shape compatible with HTTPFlowTable', () => {
    expect(historyForwardProps.pageType).toBe('History')
    expect(historyForwardProps.includeInUrl).toEqual(['yaklang.com', 'example.com'])
    expect(historyForwardProps.ProcessName).toEqual(['chrome.exe', 'burpsuite.exe'])
    expect(historyForwardProps.TagsFilter).toEqual(['RED', 'IMPORTANT'])
    expect(historyForwardProps.onlyShowFirstNode).toBe(false)
  })

  it('keeps HTTPHistory request and detail bridge helpers aligned', () => {
    const sourcePage: HTTPHistorySourcePageType = 'History'
    const packetFuzzable: HTTPPacketFuzzable = createHTTPPacketFuzzable({
      defaultPacket: 'POST /history HTTP/1.1',
    })
    const bodyRequest: HTTPFlowBodyByIdRequest = createHTTPFlowBodyByIdRequest({
      RuntimeId: 'http-history-runtime',
    })
    const detailProps: HTTPFlowDetailProp = createHTTPFlowDetailBridgeProps({
      id: 99,
      pageType: sourcePage,
      defaultPacket: packetFuzzable.defaultPacket,
    })

    const ruleDataFilterExportName: keyof HTTPFlowRuleDataFilterModule = 'HTTPFlowRuleDataFilter'
    const configPrivateDomainExportName: keyof ConfigPrivateDomainModule = 'ConfigPrivateDomain'

    expect(sourcePage).toBe('History')
    expect(packetFuzzable.defaultPacket).toBe('POST /history HTTP/1.1')
    expect(bodyRequest).toMatchObject({
      Id: 1,
      IsRequest: true,
      RuntimeId: 'http-history-runtime',
    })
    expect(detailProps).toMatchObject({
      id: 99,
      pageType: 'History',
      defaultPacket: 'POST /history HTTP/1.1',
    })
    expect(ruleDataFilterExportName).toBe('HTTPFlowRuleDataFilter')
    expect(configPrivateDomainExportName).toBe('ConfigPrivateDomain')
  })

  it('renders a stable snapshot for the HTTPHistory forwarded values', () => {
    const pageType = historyForwardProps.pageType || 'History'

    // HTTPHistoryBridgeSnapshot 组件使用小写开头的属性名
    render(
      React.createElement(HTTPHistoryBridgeSnapshot, {
        pageType,
        includeInUrl: historyForwardProps.includeInUrl,
        processName: historyForwardProps.ProcessName,
        tagsFilter: historyForwardProps.TagsFilter,
        onlyShowFirstNode: historyForwardProps.onlyShowFirstNode,
        showSourceType: historyForwardProps.showSourceType,
        showAdvancedSearch: historyForwardProps.showAdvancedSearch,
        showProtocolType: historyForwardProps.showProtocolType,
        showHistorySearch: historyForwardProps.showHistorySearch,
        showColorSwatch: historyForwardProps.showColorSwatch,
        showBatchActions: historyForwardProps.showBatchActions,
        showDelAll: historyForwardProps.showDelAll,
        showSetting: historyForwardProps.showSetting,
        showRefresh: historyForwardProps.showRefresh,
      }),
    )

    expect(screen.getByTestId('history-page-type')).toHaveTextContent('History')
    expect(screen.getByTestId('history-include-in-url')).toHaveTextContent('yaklang.com,example.com')
    expect(screen.getByTestId('history-process-name')).toHaveTextContent('chrome.exe,burpsuite.exe')
    expect(screen.getByTestId('history-tags-filter')).toHaveTextContent('RED,IMPORTANT')
    expect(screen.getByTestId('history-only-show-first-node')).toHaveTextContent('false')
    expect(screen.getByTestId('history-show-switches')).toHaveTextContent(
      'true,true,true,false,true,false,true,true,false',
    )
  })
})
