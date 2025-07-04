// src/pages/Tools/ConstructionCalculator.js

import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import "../../styles/page.css";
import "../../styles/tables.css";
import "../../styles/calculator.css";

export default function ConstructionCalculator() {
  const [display, setDisplay] = useState("0");
  const [memory, setMemory] = useState(0);
  const [unit, setUnit] = useState(null); // ft, m, in
  const [unitPower, setUnitPower] = useState(1); // 1D, 2D, 3D
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [lastValue, setLastValue] = useState(null);
  const [lastUnit, setLastUnit] = useState(null);
  const [lastPower, setLastPower] = useState(1);
  const [convertMode, setConvertMode] = useState(false);

  const handleNumber = (num) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? String(num) : display + num);
    }
  };

  const handleOperation = (nextOp) => {
    setLastValue(parseFloat(display));
    setLastUnit(unit);
    setLastPower(unitPower);
    setOperation(nextOp);
    setWaitingForOperand(true);
  };

  const handleEquals = () => {
    const current = parseFloat(display);
    let result = 0;

    if (operation && lastValue !== null) {
      switch (operation) {
        case "+":
          result = lastValue + current;
          break;
        case "-":
          result = lastValue - current;
          break;
        case "×":
          result = lastValue * current;
          if (lastUnit === unit) {
            setUnitPower(lastPower + unitPower);
          }
          break;
        case "÷":
          result = current !== 0 ? lastValue / current : 0;
          if (lastUnit === unit) {
            setUnitPower(lastPower - unitPower);
          }
          break;
        default:
          result = current;
      }
      setDisplay(String(result));
      setLastValue(null);
      setOperation(null);
      setWaitingForOperand(false);
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setMemory(0);
    setUnit(null);
    setUnitPower(1);
    setLastValue(null);
    setLastUnit(null);
    setLastPower(1);
    setOperation(null);
    setConvertMode(false);
  };

  const decimalToFeetInchFraction = (decimal) => {
    const totalInches = Math.abs(decimal) * 12;
    const feet = Math.floor(totalInches / 12);
    const remainingInches = totalInches % 12;
    const inches = Math.floor(remainingInches);
    const fraction = remainingInches - inches;
    const sixteenths = Math.round(fraction * 16);
    let fractionText = "";
    if (sixteenths > 0) {
      let num = sixteenths;
      let den = 16;
      while (num % 2 === 0 && den % 2 === 0) {
        num /= 2;
        den /= 2;
      }
      fractionText = `${num}/${den}`;
    }
    const sign = decimal < 0 ? "-" : "";
    return {
      display: `${sign}${feet}'-${inches}\"${fractionText ? ` ${fractionText}` : ""}`
    };
  };

  const cycleUnit = (selected) => {
    if (convertMode) {
      handleConvert(selected);
      setConvertMode(false);
      return;
    }
    if (unit !== selected) {
      setUnit(selected);
      setUnitPower(1);
    } else {
      setUnitPower((p) => (p === 3 ? 1 : p + 1));
    }
  };

  const handleConvert = (toUnit) => {
    const value = parseFloat(display);
    const conversions = {
      ft: { m: 0.3048, in: 12 },
      m: { ft: 1 / 0.3048 },
      in: { ft: 1 / 12 },
    };
    if (unit && conversions[unit] && conversions[unit][toUnit]) {
      const factor = conversions[unit][toUnit];
      const result = value * Math.pow(factor, unitPower);
      setDisplay(String(result));
      setUnit(toUnit);
    }
  };
  const CalcButton = ({ onClick, children, className = "", ...props }) => (
    <button
      onClick={onClick}
      className={`calc-button ${className}`}
      {...props}
    >{children}</button>
  );
  return (
    <Layout title="Construction Calculator">
      <div className="calc-container">
        <h2 className="calc-title">Construction Calculator</h2>

        <div className="calc-display">
          {display} {unit}{unitPower > 1 ? <sup>{unitPower}</sup> : ""}
          <div className="calc-display-secondary">
            {decimalToFeetInchFraction(parseFloat(display)).display}
          </div>
        </div>

        <div className="calc-button-grid">
          {[7,8,9,"÷",4,5,6,"×",1,2,3,"-",0,".","=","+"].map((btn, i) =>
            <CalcButton
              key={i}
              onClick={() => {
                if (btn === "=") handleEquals();
                else if (["+","-","×","÷"].includes(btn)) handleOperation(btn);
                else if (btn === ".") setDisplay(display.includes('.') ? display : display + '.');
                else handleNumber(btn);
              }}
              className={typeof btn === "string" ? "operator" : ""}
            >{btn}</CalcButton>
          )}
          <CalcButton onClick={handleClear} className="clear">C</CalcButton>
        </div>

        <div className="calc-unit-grid">
          <CalcButton 
            onClick={() => cycleUnit("ft")} 
            className={`unit ${unit === "ft" ? "active" : ""}`}
          >
            Feet
          </CalcButton>
          <CalcButton 
            onClick={() => cycleUnit("m")} 
            className={`unit ${unit === "m" ? "active" : ""}`}
          >
            Meters
          </CalcButton>
          <CalcButton 
            onClick={() => cycleUnit("in")} 
            className={`unit ${unit === "in" ? "active" : ""}`}
          >
            Inches
          </CalcButton>
          <CalcButton 
            onClick={() => setConvertMode(true)} 
            className="convert"
          >
            Convert
          </CalcButton>
        </div>

        <div className="calc-results-panel">
          <h4>Results</h4>
          <p><strong>Decimal:</strong> {display}</p>
          <p><strong>Feet-Inch:</strong> {decimalToFeetInchFraction(parseFloat(display)).display}</p>
          <p><strong>Memory:</strong> {memory}</p>
          {operation && <p><strong>Last Operation:</strong> {lastValue} {operation} ...</p>}
        </div>
      </div>
    </Layout>
  );
}