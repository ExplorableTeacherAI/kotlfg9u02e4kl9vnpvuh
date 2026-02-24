import React, { ReactElement } from 'react';
import { Block } from '@/components/templates';
import {
    StackLayout,
    SplitLayout,
} from '@/components/layouts';
import {
    EditableH1,
    EditableH2,
    EditableParagraph,
    InlineScrubbleNumber,
    InlineFormula,
    InlineSpotColor,
} from '@/components/atoms';
import {
    getVariableInfo,
    numberPropsFromDefinition,
} from '../variables';
import { Cartesian2D } from '@/components/atoms';
import { useVar, useSetVar } from '@/stores';

/**
 * Interactive visualization for the unit circle with draggable angle
 */
function UnitCircleVisualization() {
    const angle = useVar('angleValue', Math.PI / 4) as number;
    const setVar = useSetVar();

    const cos_val = Math.cos(angle);
    const sin_val = Math.sin(angle);

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-background rounded-lg border border-border">
            <svg
                width="300"
                height="300"
                viewBox="-150 -150 300 300"
                className="mb-4"
            >
                {/* Grid */}
                <defs>
                    <pattern
                        id="grid"
                        width="30"
                        height="30"
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d="M 30 0 L 0 0 0 30"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="0.5"
                        />
                    </pattern>
                </defs>

                {/* Axes */}
                <line x1="-140" y1="0" x2="140" y2="0" stroke="#999" strokeWidth="1" />
                <line x1="0" y1="-140" x2="0" y2="140" stroke="#999" strokeWidth="1" />

                {/* Unit circle */}
                <circle cx="0" cy="0" r="100" fill="none" stroke="#ccc" strokeWidth="1" />

                {/* Angle arc */}
                <path
                    d={`M 100 0 A 100 100 0 ${angle > Math.PI ? 1 : 0} 1 ${100 * cos_val} ${-100 * sin_val}`}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                />

                {/* Radius to point */}
                <line
                    x1="0"
                    y1="0"
                    x2={100 * cos_val}
                    y2={-100 * sin_val}
                    stroke="#3b82f6"
                    strokeWidth="2"
                />

                {/* Point on circle */}
                <circle
                    cx={100 * cos_val}
                    cy={-100 * sin_val}
                    r="6"
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth="2"
                    style={{ cursor: 'grab' }}
                    onMouseDown={(e) => {
                        const svg = e.currentTarget.ownerSVGElement;
                        if (!svg) return;
                        const rect = svg.getBoundingClientRect();
                        const handleMouseMove = (moveEvent: MouseEvent) => {
                            const x =
                                moveEvent.clientX -
                                rect.left -
                                rect.width / 2;
                            const y =
                                rect.height / 2 -
                                (moveEvent.clientY - rect.top);
                            const newAngle = Math.atan2(y, x);
                            setVar(
                                'angleValue',
                                newAngle < 0 ? newAngle + 2 * Math.PI : newAngle,
                            );
                        };
                        const handleMouseUp = () => {
                            document.removeEventListener(
                                'mousemove',
                                handleMouseMove,
                            );
                            document.removeEventListener(
                                'mouseup',
                                handleMouseUp,
                            );
                        };
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                    }}
                />

                {/* sin projection (vertical) */}
                <line
                    x1={100 * cos_val}
                    y1={-100 * sin_val}
                    x2={100 * cos_val}
                    y2="0"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                />
                <text x={100 * cos_val + 10} y="15" fontSize="12" fill="#ef4444" fontWeight="bold">
                    sin
                </text>

                {/* cos projection (horizontal) */}
                <line
                    x1={100 * cos_val}
                    y1={-100 * sin_val}
                    x2="0"
                    y2={-100 * sin_val}
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                />
                <text x="-10" y={-100 * sin_val - 10} fontSize="12" fill="#10b981" fontWeight="bold">
                    cos
                </text>
            </svg>

            <div className="text-sm text-muted-foreground text-center">
                Drag the point around the circle
            </div>
        </div>
    );
}

/**
 * Inverse visualization: given sine value, find angle
 */
function InverseLookupVisualization() {
    const sine = useVar('sineValue', 0.707) as number;
    const setVar = useSetVar();

    // Calculate angles that have this sine value
    const angle1 = Math.asin(Math.max(-1, Math.min(1, sine)));
    const angle2 = Math.PI - angle1;

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-background rounded-lg border border-border">
            <div className="w-full mb-6">
                <p className="text-sm font-semibold mb-2">Given: sin(θ) = {sine.toFixed(3)}</p>
                <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.05"
                    value={sine}
                    onChange={(e) => setVar('sineValue', parseFloat(e.target.value))}
                    className="w-full"
                />
            </div>

            <svg
                width="280"
                height="280"
                viewBox="-140 -140 280 280"
                className="mb-4"
            >
                {/* Circle */}
                <circle cx="0" cy="0" r="100" fill="none" stroke="#ccc" strokeWidth="1" />

                {/* Axes */}
                <line x1="-120" y1="0" x2="120" y2="0" stroke="#999" strokeWidth="1" />
                <line x1="0" y1="-120" x2="0" y2="120" stroke="#999" strokeWidth="1" />

                {/* Sine line (horizontal) */}
                <line
                    x1="-100"
                    y1={-100 * sine}
                    x2="100"
                    y2={-100 * sine}
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    opacity="0.6"
                />

                {/* First intersection point */}
                <circle
                    cx={100 * Math.cos(angle1)}
                    cy={-100 * Math.sin(angle1)}
                    r="6"
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth="2"
                />
                <line
                    x1="0"
                    y1="0"
                    x2={100 * Math.cos(angle1)}
                    y2={-100 * Math.sin(angle1)}
                    stroke="#3b82f6"
                    strokeWidth="2"
                />

                {/* Second intersection point */}
                <circle
                    cx={100 * Math.cos(angle2)}
                    cy={-100 * Math.sin(angle2)}
                    r="6"
                    fill="#8b5cf6"
                    stroke="white"
                    strokeWidth="2"
                />
                <line
                    x1="0"
                    y1="0"
                    x2={100 * Math.cos(angle2)}
                    y2={-100 * Math.sin(angle2)}
                    stroke="#8b5cf6"
                    strokeWidth="2"
                />

                {/* Labels */}
                <text x={100 * Math.cos(angle1) + 10} y={-100 * Math.sin(angle1) - 10} fontSize="11" fill="#3b82f6" fontWeight="bold">
                    θ₁
                </text>
                <text x={100 * Math.cos(angle2) - 20} y={-100 * Math.sin(angle2) - 10} fontSize="11" fill="#8b5cf6" fontWeight="bold">
                    θ₂
                </text>
            </svg>

            <div className="text-xs text-muted-foreground text-center">
                <p>θ₁ ≈ {(angle1 * 180 / Math.PI).toFixed(1)}°</p>
                <p>θ₂ ≈ {(angle2 * 180 / Math.PI).toFixed(1)}°</p>
            </div>
        </div>
    );
}

export const section1Blocks: ReactElement[] = [
    // Title
    <StackLayout key="layout-s1-title" maxWidth="2xl">
        <Block id="block-s1-title" padding="lg">
            <EditableH1 id="h1-s1-title" blockId="block-s1-title">
                Why Do We Need Inverse Functions?
            </EditableH1>
        </Block>
    </StackLayout>,

    // Intro paragraph
    <StackLayout key="layout-s1-intro" maxWidth="2xl">
        <Block id="block-s1-intro" padding="md">
            <EditableParagraph id="para-s1-intro" blockId="block-s1-intro">
                So far, you've learned that trigonometric functions like <InlineFormula latex="\sin(\theta)" colorMap={{}} /> take an <InlineSpotColor color="#3b82f6">angle</InlineSpotColor> as input and give us a <InlineSpotColor color="#ef4444">ratio</InlineSpotColor> as output. But what if we need to work backwards? What if we know the ratio and want to find the angle?
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Interactive section: Forward direction
    <StackLayout key="layout-s1-forward-title" maxWidth="2xl">
        <Block id="block-s1-forward-title" padding="md">
            <EditableH2 id="h2-s1-forward" blockId="block-s1-forward-title">
                The Regular Way: From Angle to Ratio
            </EditableH2>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-s1-forward" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="block-s1-angle-description" padding="sm">
                <EditableParagraph id="para-s1-angle-desc" blockId="block-s1-angle-description">
                    Start with an angle <InlineScrubbleNumber varName="angleValue" {...numberPropsFromDefinition(getVariableInfo('angleValue'))} /> radians.
                </EditableParagraph>
            </Block>
            <Block id="block-s1-angle-explanation" padding="sm">
                <EditableParagraph id="para-s1-angle-explain" blockId="block-s1-angle-explanation">
                    Drag the point on the unit circle to change the angle. Watch how the red and green dashed lines show the <InlineFormula latex="\sin(\theta)" colorMap={{}} /> and <InlineFormula latex="\cos(\theta)" colorMap={{}} /> values.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="block-s1-circle-viz" padding="sm">
            <UnitCircleVisualization />
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-block-1771941171733" maxWidth="xl">
        <Block id="block-1771941171733" padding="sm">
            <hr className="my-6 border-t border-gray-200" />
        </Block>
    </StackLayout>,

    // The problem statement
    <StackLayout key="layout-s1-problem-title" maxWidth="2xl">
        <Block id="block-s1-problem-title" padding="md">
            <EditableH2 id="h2-s1-problem" blockId="block-s1-problem-title">
                The Problem: From Ratio Back to Angle
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-s1-problem" maxWidth="2xl">
        <Block id="block-s1-problem-text" padding="sm">
            <EditableParagraph id="para-s1-problem" blockId="block-s1-problem-text">
                Now imagine a different scenario: You're given that <InlineFormula latex="\sin(\theta) = 0.5" colorMap={{}} />, but you don't know what angle <InlineFormula latex="\theta" colorMap={{}} /> is. How do you find it?{" "}
                {"  "}
                <InlineFormula latex="\sin(\theta) = 0.5" colorMap={{}} color="#000000" />
                {"  "}
                <InlineFormula latex="\theta" colorMap={{}} color="#000000" />
                {"  "}
                <InlineScrubbleNumber defaultValue={10} min={0} max={100} step={1} varName="var_inlineScrubbleNumber-1771941254021" />
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Interactive inverse lookup
    <StackLayout key="layout-s1-inverse-title" maxWidth="2xl">
        <Block id="block-s1-inverse-title" padding="md">
            <EditableH2 id="h2-s1-inverse" blockId="block-s1-inverse-title">
                The Solution: Inverse Trigonometric Functions
            </EditableH2>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-s1-inverse" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="block-s1-inverse-desc" padding="sm">
                <EditableParagraph id="para-s1-inverse-desc" blockId="block-s1-inverse-desc">
                    Drag the slider below to choose a sine value. The unit circle shows all the angles that produce this sine value.
                </EditableParagraph>
            </Block>
            <Block id="block-s1-inverse-note" padding="sm">
                <EditableParagraph id="para-s1-inverse-note" blockId="block-s1-inverse-note">
                    Notice something interesting: most sine values correspond to <strong>two different angles</strong> in the range [0°, 360°)! This is why we need to restrict the domain of inverse sine to make it a true function.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="block-s1-inverse-viz" padding="sm">
            <InverseLookupVisualization />
        </Block>
    </SplitLayout>,

    // Closure paragraph
    <StackLayout key="layout-s1-closure" maxWidth="2xl">
        <Block id="block-s1-closure" padding="md">
            <EditableParagraph id="para-s1-closure" blockId="block-s1-closure">
                This is exactly what inverse trigonometric functions do: they "undo" the regular trig functions. Instead of going from angle → ratio, they go from ratio → angle. In the next sections, we'll explore <InlineFormula latex="\arcsin" colorMap={{}} />, <InlineFormula latex="\arccos" colorMap={{}} />, and <InlineFormula latex="\arctan" colorMap={{}} /> in depth.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
