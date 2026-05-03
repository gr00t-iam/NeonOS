import { useState } from 'react'

const BUTTONS = [
  ['AC', '+/−', '%', '÷'],
  ['7',  '8',  '9', '×'],
  ['4',  '5',  '6', '−'],
  ['1',  '2',  '3', '+'],
  ['0',       '.',  '='],
]

const OPS = ['÷', '×', '−', '+']

function calc(a, b, op) {
  switch (op) {
    case '+': return a + b
    case '−': return a - b
    case '×': return a * b
    case '÷': return b !== 0 ? a / b : 'Error'
    default:  return b
  }
}

export default function Calculator() {
  const [display,          setDisplay]          = useState('0')
  const [operand,          setOperand]          = useState(null)
  const [operator,         setOperator]         = useState(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const fmt = (n) => {
    if (n === 'Error') return 'Error'
    const s = String(n)
    return s.length > 10 ? parseFloat(n.toPrecision(8)).toString() : s
  }

  const press = (val) => {
    if (val === 'AC') {
      setDisplay('0'); setOperand(null); setOperator(null); setWaitingForOperand(false)
      return
    }
    if (val === '+/−') { setDisplay((d) => d === 'Error' ? d : fmt(parseFloat(d) * -1)); return }
    if (val === '%')   { setDisplay((d) => d === 'Error' ? d : fmt(parseFloat(d) / 100));  return }

    if (OPS.includes(val)) {
      const cur = parseFloat(display)
      if (operand !== null && !waitingForOperand) {
        const res = calc(operand, cur, operator)
        setDisplay(fmt(res))
        setOperand(res)
      } else {
        setOperand(cur)
      }
      setOperator(val)
      setWaitingForOperand(true)
      return
    }

    if (val === '=') {
      if (operator && operand !== null) {
        const res = calc(operand, parseFloat(display), operator)
        setDisplay(fmt(res))
        setOperand(null); setOperator(null); setWaitingForOperand(false)
      }
      return
    }

    if (val === '.') {
      if (waitingForOperand) { setDisplay('0.'); setWaitingForOperand(false); return }
      if (!display.includes('.')) setDisplay((d) => d + '.')
      return
    }

    // Digit
    if (waitingForOperand) {
      setDisplay(val); setWaitingForOperand(false)
    } else {
      setDisplay((d) => d === '0' || d === 'Error' ? val : d.length < 10 ? d + val : d)
    }
  }

  return (
    <div className="flex flex-col h-full p-3 gap-2" style={{ background: '#1c1c1e' }}>
      {/* Display */}
      <div className="flex-1 flex flex-col justify-end items-end px-4 py-2 min-h-[80px]">
        {operator && (
          <span className="text-white/30 text-sm mb-1">{operand} {operator}</span>
        )}
        <span
          className="text-white font-light leading-none"
          style={{ fontSize: display.length > 9 ? '2rem' : display.length > 6 ? '2.5rem' : '3rem' }}
        >
          {display}
        </span>
      </div>

      {/* Buttons */}
      <div className="grid gap-2">
        {BUTTONS.map((row, ri) => (
          <div
            key={ri}
            className={`grid gap-2 ${row.length === 4 ? 'grid-cols-4' : 'grid-cols-4'}`}
          >
            {row.map((btn, bi) => {
              const isZero     = btn === '0'
              const isTopRow   = ri === 0
              const isOperator = OPS.includes(btn) || btn === '='
              return (
                <button
                  key={bi}
                  className={`h-14 rounded-full text-xl font-medium transition-all active:scale-95 focus:outline-none ${
                    isZero ? 'col-span-2 text-left pl-6' : ''
                  } ${
                    isTopRow
                      ? 'bg-gray-400 text-black hover:bg-gray-300'
                      : isOperator
                      ? 'bg-orange-500 text-white hover:bg-orange-400'
                      : 'bg-[#333336] text-white hover:bg-[#48484a]'
                  }`}
                  onClick={() => press(btn)}
                >
                  {btn}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
