import { act, render, screen } from '@testing-library/react'
import Footer from '../src/components/Footer/index'
import {libWebSetup} from '../public/libs/eversdk-web';

const setup = () => {
  libWebSetup({
    binaryURL: `${location.origin}/libs/eversdk-web/eversdk.wasm`
  })
}

jest.mock('../public/libs/eversdk-web', () => ({
  libWebSetup: setup
}))

jest.mock('freeton', () => ({
  providers: {
    ExtensionProvider: () => {}
  }
}))

describe('Footer',  () => {
  test('renders a rights', async () => {
    render(<Footer />)

    const heading = screen.getByText('(c) 2021 Nifi, Inc All rights reserved', {
    })

    expect(heading).toBeInTheDocument()
  })
  test('renders a test', () => {
    render(<Footer />)

    expect(2 + 2).toBe(4)
  })
})
