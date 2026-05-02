import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { LinkAnalyticsPage } from './link-analytics-page'

const useLinkAnalyticsSummaryMock = vi.fn()
const useLinkClicksByDayMock = vi.fn()
const useLinkAnalyticsEventsMock = vi.fn()

vi.mock('../hooks/use-link-analytics', () => ({
  useLinkAnalyticsSummary: (...args: unknown[]) => useLinkAnalyticsSummaryMock(...args),
  useLinkClicksByDay: (...args: unknown[]) => useLinkClicksByDayMock(...args),
  useLinkAnalyticsEvents: (...args: unknown[]) => useLinkAnalyticsEventsMock(...args),
}))

function buildQueryClient() {
  return new QueryClient()
}

function renderPage() {
  const queryClient = buildQueryClient()
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/links/link-1/analytics']}>
        <Routes>
          <Route path="/links/:id/analytics" element={<LinkAnalyticsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('LinkAnalyticsPage', () => {
  it('shows forbidden state for 403 summary errors', () => {
    useLinkAnalyticsSummaryMock.mockReturnValue({
      error: { code: 'FORBIDDEN', message: 'Forbidden', status: 403 },
      isError: true,
      isLoading: false,
      isSuccess: false,
      refetch: vi.fn(),
    })
    useLinkClicksByDayMock.mockReturnValue({
      isError: false,
      isLoading: false,
      isSuccess: true,
      refetch: vi.fn(),
    })
    useLinkAnalyticsEventsMock.mockReturnValue({
      isError: false,
      isLoading: false,
      isSuccess: true,
      refetch: vi.fn(),
    })

    renderPage()

    expect(screen.getByText(/access denied/i)).toBeInTheDocument()
  })

  it('shows not found state for 404 summary errors', () => {
    useLinkAnalyticsSummaryMock.mockReturnValue({
      error: { code: 'NOT_FOUND', message: 'Not found', status: 404 },
      isError: true,
      isLoading: false,
      isSuccess: false,
      refetch: vi.fn(),
    })
    useLinkClicksByDayMock.mockReturnValue({
      isError: false,
      isLoading: false,
      isSuccess: true,
      refetch: vi.fn(),
    })
    useLinkAnalyticsEventsMock.mockReturnValue({
      isError: false,
      isLoading: false,
      isSuccess: true,
      refetch: vi.fn(),
    })

    renderPage()

    expect(screen.getByText(/^not found$/i)).toBeInTheDocument()
  })

  it('renders main summary cards', () => {
    useLinkAnalyticsSummaryMock.mockReturnValue({
      isLoading: false,
      isError: false,
      isSuccess: true,
      data: {
        linkId: 'link-1',
        shortCode: 'backend',
        totalClicks: 120,
        clicksToday: 12,
        clicksLast7Days: 84,
        lastAccessAt: '2026-04-23T18:30:00.000Z',
      },
    })
    useLinkClicksByDayMock.mockReturnValue({
      isLoading: false,
      isError: false,
      isSuccess: true,
      data: [
        { date: '2026-04-21', clicks: 20 },
        { date: '2026-04-22', clicks: 35 },
      ],
    })
    useLinkAnalyticsEventsMock.mockReturnValue({
      isLoading: false,
      isError: false,
      isSuccess: true,
      data: {
        data: [],
        pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 1 },
      },
    })

    renderPage()

    expect(screen.getByText(/total clicks/i)).toBeInTheDocument()
    expect(screen.getByText(/clicks today/i)).toBeInTheDocument()
    expect(screen.getByText(/last 7 days/i)).toBeInTheDocument()
    expect(screen.getByText(/last access/i)).toBeInTheDocument()
  })
})
