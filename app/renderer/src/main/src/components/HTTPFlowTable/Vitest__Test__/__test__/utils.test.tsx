import { describe, expect, it } from 'vitest'
import {
  DurationMsToColor,
  HTTP_FLOW_FAVORITE_TAG,
  LogLevelToCode,
  StatusCodeToColor,
  buildFavoriteTags,
  buildHTTPFlowQueryTags,
  filterHTTPFlowsByFavoriteAndTags,
  getHTTPFlowReqAndResToString,
  onConvertBodySizeToB,
  onConvertBodySizeByUnit,
  isHTTPFlowFavorite,
  type HTTPFlow,
} from '@/components/HTTPFlowTable/HTTPFlowTable'
import { filterData } from '@/components/HTTPFlowTable/Vitest__Test__'

describe('HTTPFlowTable Vitest helpers', () => {
  it('converts request and response payloads to strings', () => {
    const result = getHTTPFlowReqAndResToString({
      Id: 1,
      Request: new Uint8Array([72, 73]),
      Response: new Uint8Array([79, 75]),
    } as unknown as HTTPFlow)

    expect(result).toMatchObject({
      Id: 1,
      RequestString: 'HI',
      ResponseString: 'OK',
    })
  })

  it('returns empty strings when payload is missing', () => {
    const result = getHTTPFlowReqAndResToString({ Id: 2 } as unknown as HTTPFlow)
    expect(result).toMatchObject({
      Id: 2,
      RequestString: '',
      ResponseString: '',
    })
  })

  it('deduplicates rows by a given key', () => {
    const result = filterData(
      [
        { Id: 1, Path: '/a' },
        { Id: 1, Path: '/b' },
        { Id: 2, Path: '/c' },
      ],
      'Id',
    )

    expect(result).toEqual([
      { Id: 1, Path: '/a' },
      { Id: 2, Path: '/c' },
    ])
  })

  it('converts body length values across units', () => {
    expect(onConvertBodySizeByUnit(2, 'B')).toBe(2)
    expect(onConvertBodySizeByUnit(2, 'K')).toBe(2048)
    expect(onConvertBodySizeByUnit(2, 'M')).toBe(2097152)
  })

  it('converts body length to B-based display value', () => {
    expect(onConvertBodySizeToB(2, 'B')).toBe(2)
    expect(onConvertBodySizeToB(2048, 'K')).toBe(2)
    expect(onConvertBodySizeToB(2097152, 'M')).toBe(2)
    expect(onConvertBodySizeToB(1537, 'K')).toBe(2)
  })

  it('maps status code and duration to color token', () => {
    expect(StatusCodeToColor(200)).toContain('Success')
    expect(StatusCodeToColor(302)).toContain('Warning')
    expect(StatusCodeToColor(500)).toContain('danger')

    expect(DurationMsToColor(120)).toContain('Success')
    expect(DurationMsToColor(350)).toContain('Warning')
    expect(DurationMsToColor(900)).toContain('danger')
  })

  it('maps log level aliases to color code', () => {
    expect(LogLevelToCode('INFO')).toBe('blue')
    expect(LogLevelToCode('warn')).toBe('orange')
    expect(LogLevelToCode('critical')).toBe('red')
    expect(LogLevelToCode('finished')).toBe('green')
    expect(LogLevelToCode('debug')).toBe('gray')
    expect(LogLevelToCode('unknown-level')).toBe('blue')
  })

  it('handles favorite tags helpers', () => {
    const favoriteTags = buildFavoriteTags('A|B', true)
    expect(favoriteTags).toContain('A')
    expect(favoriteTags).toContain('B')
    expect(favoriteTags).toContain(HTTP_FLOW_FAVORITE_TAG)

    const nonFavoriteTags = buildFavoriteTags(`A|${HTTP_FLOW_FAVORITE_TAG}|B`, false)
    expect(nonFavoriteTags).toEqual(['A', 'B'])

    expect(buildHTTPFlowQueryTags(['RED'], true)).toEqual(['RED', HTTP_FLOW_FAVORITE_TAG])
    expect(buildHTTPFlowQueryTags(['RED'], false)).toEqual(['RED'])
  })

  it('filters flows by favorite and color tags', () => {
    const list = [
      { Id: 1, Tags: `${HTTP_FLOW_FAVORITE_TAG}|RED` },
      { Id: 2, Tags: 'GREEN' },
      { Id: 3, Tags: `${HTTP_FLOW_FAVORITE_TAG}|BLUE` },
    ] as HTTPFlow[]

    expect(isHTTPFlowFavorite(list[0])).toBe(true)
    expect(isHTTPFlowFavorite(list[1])).toBe(false)

    const onlyFavorite = filterHTTPFlowsByFavoriteAndTags(list, [], true)
    expect(onlyFavorite.map((item) => item.Id)).toEqual([1, 3])

    const favoriteAndRed = filterHTTPFlowsByFavoriteAndTags(list, ['RED'], true)
    expect(favoriteAndRed.map((item) => item.Id)).toEqual([1])

    const redOrGreen = filterHTTPFlowsByFavoriteAndTags(list, ['RED', 'GREEN'], false)
    expect(redOrGreen.map((item) => item.Id)).toEqual([1, 2])
  })

  it('handles empty array in filterData', () => {
    const result = filterData([], 'Id')
    expect(result).toEqual([])
  })

  it('handles single item in filterData', () => {
    const result = filterData([{ Id: 1, Path: '/a' }], 'Id')
    expect(result).toEqual([{ Id: 1, Path: '/a' }])
  })
})
