/**
 * 仅作 HTTPFlowTable 相关逻辑的 Vitest 夹具；不增加仓库级脚本。
 * 仓库根目录运行本目录全部用例：yarn test:vitest app/renderer/src/main/src/components/HTTPFlowTable/Vitest__Test__ --run
 */
import React, { FC } from 'react'
import { getHTTPFlowReqAndResToString, onConvertBodySizeByUnit } from '../HTTPFlowTable'
import type { HTTPFlow } from '../HTTPFlowTable'
import type { HTTPFlowTableProp } from '../HTTPFlowTable'
import type { HTTPFlowBodyByIdRequest, HTTPHistorySourcePageType, HTTPPacketFuzzable } from '@/components/HTTPHistory'
import type { HTTPFlowDetailProp } from '@/components/HTTPFlowDetail'

export const filterData = <T extends object, K extends keyof T>(filterArr: T[], key: K) => {
  const valueSet = new Set<T[K]>()
  return filterArr.filter((item) => {
    const current = item[key]
    if (valueSet.has(current)) {
      return false
    }
    valueSet.add(current)
    return true
  })
}

export const createHTTPHistoryForwardProps = (): Partial<HTTPFlowTableProp> => ({
  pageType: 'History',
  includeInUrl: ['yaklang.com', 'example.com'],
  ProcessName: ['chrome.exe', 'burpsuite.exe'],
  TagsFilter: ['RED', 'IMPORTANT'],
  onlyShowFirstNode: false,
  showSourceType: true,
  showAdvancedSearch: true,
  showProtocolType: true,
  showHistorySearch: false,
  showColorSwatch: true,
  showBatchActions: false,
  showDelAll: true,
  showSetting: true,
  showRefresh: false,
})

export const createHTTPPacketFuzzable = (overrides: Partial<HTTPPacketFuzzable> = {}): HTTPPacketFuzzable => ({
  defaultHttps: true,
  defaultPacket: 'GET / HTTP/1.1',
  downstreamProxyStr: 'http://127.0.0.1:8080',
  sendToWebFuzzer: false,
  ...overrides,
})

export const createHTTPFlowBodyByIdRequest = (
  overrides: Partial<HTTPFlowBodyByIdRequest> = {},
): HTTPFlowBodyByIdRequest => ({
  Id: 1,
  IsRequest: true,
  BufSize: 4096,
  RuntimeId: 'history-runtime',
  IsRisk: false,
  ...overrides,
})

export const createHTTPFlowDetailBridgeProps = (overrides: Partial<HTTPFlowDetailProp> = {}): HTTPFlowDetailProp => {
  const pageType: HTTPHistorySourcePageType = overrides.pageType || 'History'

  return {
    id: 1,
    pageType,
    ...createHTTPPacketFuzzable(),
    ...overrides,
  }
}

interface VitestTestProps {
  bodyLength?: number
  unit?: 'B' | 'K' | 'M'
}

interface HTTPHistoryBridgeSnapshotProps {
  pageType: string
  includeInUrl?: string[]
  processName?: string[]
  tagsFilter?: string[]
  onlyShowFirstNode?: boolean
  showSourceType?: boolean
  showAdvancedSearch?: boolean
  showProtocolType?: boolean
  showHistorySearch?: boolean
  showColorSwatch?: boolean
  showBatchActions?: boolean
  showDelAll?: boolean
  showSetting?: boolean
  showRefresh?: boolean
}

export const HTTPHistoryBridgeSnapshot: FC<HTTPHistoryBridgeSnapshotProps> = ({
  pageType,
  includeInUrl = [],
  processName = [],
  tagsFilter = [],
  onlyShowFirstNode = true,
  showSourceType = true,
  showAdvancedSearch = true,
  showProtocolType = true,
  showHistorySearch = true,
  showColorSwatch = true,
  showBatchActions = true,
  showDelAll = true,
  showSetting = true,
  showRefresh = true,
}) => {
  return (
    <div data-testid="history-bridge-snapshot">
      <div data-testid="history-page-type">{pageType}</div>
      <div data-testid="history-include-in-url">{includeInUrl.join(',')}</div>
      <div data-testid="history-process-name">{processName.join(',')}</div>
      <div data-testid="history-tags-filter">{tagsFilter.join(',')}</div>
      <div data-testid="history-only-show-first-node">{String(onlyShowFirstNode)}</div>
      <div data-testid="history-show-switches">
        {[
          showSourceType,
          showAdvancedSearch,
          showProtocolType,
          showHistorySearch,
          showColorSwatch,
          showBatchActions,
          showDelAll,
          showSetting,
          showRefresh,
        ].join(',')}
      </div>
    </div>
  )
}

const Vitest__Test__: FC<VitestTestProps> = ({ bodyLength = 2, unit = 'K' }) => {
  const flow = getHTTPFlowReqAndResToString({
    Request: new Uint8Array([65, 66]),
    Response: new Uint8Array([67]),
  } as unknown as HTTPFlow)
  const deduplicated = filterData(
    [
      { Id: 1, Path: '/a' },
      { Id: 1, Path: '/b' },
      { Id: 2, Path: '/c' },
    ],
    'Id',
  )

  return (
    <div>
      <div data-testid="httpflow-vitest-page">http flow table vitest test page</div>
      <div data-testid="request-string">{flow.RequestString}</div>
      <div data-testid="response-string">{flow.ResponseString}</div>
      <div data-testid="converted-size">{onConvertBodySizeByUnit(bodyLength, unit)}</div>
      <div data-testid="dedup-size">{deduplicated.length}</div>
    </div>
  )
}

export { Vitest__Test__ }
