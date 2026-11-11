import { describe, expect, it } from 'vitest'
import { emptySelection, observationGroups, parseSelection, serializeSelection } from './attendance.observations'

describe('attendance observation persistence', () => {
  const options = observationGroups[0].options
  it('allows optional groups to be empty', () => {
    expect(serializeSelection(emptySelection())).toBe('')
    expect(parseSelection(null, options)).toEqual(emptySelection())
  })
  it('restores multiple choices and multiline custom text when editing', () => {
    const value = { selected: [options[0], options[2]], other: true, text: 'Detalhes\nSegunda linha' }
    expect(parseSelection(serializeSelection(value), options)).toEqual(value)
  })
  it('preserves existing free text and unknown options', () => {
    for (const text of ['Relato antigo\nCompleto', '• Opção antiga']) {
      expect(parseSelection(text, options)).toEqual({ selected: [], other: true, text })
    }
  })
  it('does not persist custom text after Other is unchecked', () => {
    const serialized = serializeSelection({ selected: [options[0]], other: false, text: 'Rascunho' })
    expect(parseSelection(serialized, options)).toEqual({ selected: [options[0]], other: false, text: '' })
  })
})
