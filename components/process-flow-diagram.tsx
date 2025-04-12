"use client"

import { useState, useCallback, useEffect } from "react"
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
  ConnectionLineType,
  Position,
} from "reactflow"
import "reactflow/dist/style.css"
import { Card, CardContent } from "@/components/ui/card"

// Custom node components
const EquipmentNode = ({ data }) => {
  return (
    <div className="bg-white border-2 border-emerald-500 rounded-lg p-3 shadow-md w-[180px]">
      <div className="font-bold text-sm mb-1">{data.label}</div>
      {data.description && <div className="text-xs text-gray-500">{data.description}</div>}
      {data.hasAlternatives && (
        <div className="mt-2 bg-emerald-50 p-1 rounded text-xs text-emerald-700 flex items-center justify-center">
          Alternatives Available
        </div>
      )}
    </div>
  )
}

const AlternativeNode = ({ data }) => {
  return (
    <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-3 shadow-md w-[200px]">
      <div className="font-bold text-sm mb-1">{data.label}</div>
      <div className="text-xs text-gray-500 mb-2">{data.description}</div>
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium">
          Current: {data.options.find((opt) => opt.value === data.selected)?.label}
        </div>
        <div className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">
          Options: {data.options.length}
        </div>
      </div>
    </div>
  )
}

// Node types
const nodeTypes = {
  equipment: EquipmentNode,
  alternative: AlternativeNode,
}

export default function ProcessFlowDiagram({ parameters, onAlternativeSelection }) {
  // Generate nodes based on parameters
  const generateNodes = useCallback(() => {
    const nodes = [
      {
        id: "1",
        type: "equipment",
        position: { x: 50, y: 100 },
        data: {
          label: "Bioreactor",
          description: `${parameters.microbialHost} cells`,
          hasAlternatives: false,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
      {
        id: "2",
        type: "alternative",
        position: { x: 300, y: 100 },
        data: {
          label: "Harvest Clarification",
          description: "Removal of cells and debris",
          category: "harvestClarification",
          selected: parameters.harvestClarification,
          options: [
            {
              value: "Centrifuge",
              label: "Centrifuge",
              capex: 500000,
              opex: 100000,
              description: "High-speed centrifugation for cell separation",
            },
            {
              value: "Depth Filtration",
              label: "Depth Filtration",
              capex: 300000,
              opex: 150000,
              description: "Multi-layer filtration for cell removal",
            },
          ],
          onSelect: onAlternativeSelection,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
      {
        id: "3",
        type: "alternative",
        position: { x: 550, y: 100 },
        data: {
          label: "Capture Step",
          description: "Initial product purification",
          category: "captureStep",
          selected: parameters.captureStep,
          options: [
            {
              value: "Standard Resin",
              label: "Standard Resin Column",
              capex: 500000,
              opex: 150000,
              description: "Standard size chromatography column",
            },
            {
              value: "Large Resin",
              label: "Larger Column Size",
              capex: 800000,
              opex: 120000,
              description: "Larger diameter chromatography column with higher throughput",
            },
          ],
          onSelect: onAlternativeSelection,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
      {
        id: "4",
        type: "equipment",
        position: { x: 800, y: 100 },
        data: {
          label: "Polishing",
          description: "Final purification",
          hasAlternatives: false,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
      {
        id: "5",
        type: "alternative",
        position: { x: 550, y: 250 },
        data: {
          label: "Buffer Preparation",
          description: "Buffer storage system",
          category: "bufferPrep",
          selected: parameters.bufferPrep,
          options: [
            {
              value: "Stainless Steel Tanks",
              label: "Stainless Steel Tanks",
              capex: 400000,
              opex: 50000,
              description: "Traditional stainless steel buffer preparation tanks",
            },
            {
              value: "Single-Use Bags",
              label: "Single-Use Bags",
              capex: 200000,
              opex: 100000,
              description: "Disposable buffer preparation bags with lower capital cost",
            },
          ],
          onSelect: onAlternativeSelection,
        },
        sourcePosition: Position.Top,
        targetPosition: Position.Bottom,
      },
      {
        id: "6",
        type: "equipment",
        position: { x: 1050, y: 100 },
        data: {
          label: "Final Formulation",
          description: "Product finishing",
          hasAlternatives: false,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
    ]

    return nodes
  }, [parameters])

  // Generate edges
  const generateEdges = () => {
    const edges = [
      {
        id: "e1-2",
        source: "1",
        target: "2",
        animated: true,
        style: { stroke: "#10b981" },
        type: "smoothstep",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#10b981",
        },
      },
      {
        id: "e2-3",
        source: "2",
        target: "3",
        animated: true,
        style: { stroke: "#10b981" },
        type: "smoothstep",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#10b981",
        },
      },
      {
        id: "e3-4",
        source: "3",
        target: "4",
        animated: true,
        style: { stroke: "#10b981" },
        type: "smoothstep",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#10b981",
        },
      },
      {
        id: "e5-3",
        source: "5",
        target: "3",
        animated: true,
        style: { stroke: "#10b981" },
        type: "smoothstep",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#10b981",
        },
      },
      {
        id: "e4-6",
        source: "4",
        target: "6",
        animated: true,
        style: { stroke: "#10b981" },
        type: "smoothstep",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#10b981",
        },
      },
    ]

    return edges
  }

  const [nodes, setNodes, onNodesChange] = useNodesState(generateNodes())
  const [edges, setEdges, onEdgesChange] = useEdgesState(generateEdges())

  const [selectedNode, setSelectedNode] = useState(null)

  // Update nodes when parameters change
  useEffect(() => {
    setNodes(generateNodes())
  }, [parameters, generateNodes, setNodes])

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node)
  }, [])

  const handleOptionSelect = (category, value) => {
    // Call the parent component's handler to update the global state
    onAlternativeSelection(category, value)
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 h-[600px] border rounded-lg">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            connectionLineType={ConnectionLineType.SmoothStep}
            defaultEdgeOptions={{
              type: "smoothstep",
              style: { stroke: "#10b981" },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: "#10b981",
              },
            }}
          >
            <Background />
            <Controls />
            <Panel position="top-left" className="bg-white p-2 rounded shadow-md text-sm">
              <div className="font-semibold">Process Flow Diagram</div>
              <div className="text-xs text-muted-foreground">Click on equipment for details</div>
            </Panel>
          </ReactFlow>
        </div>

        {selectedNode && (
          <Card className="w-full md:w-80 h-fit">
            <CardContent className="p-4">
              <h3 className="font-bold mb-2">{selectedNode.data.label}</h3>
              <p className="text-sm text-muted-foreground mb-4">{selectedNode.data.description}</p>

              {selectedNode.type === "equipment" && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold">Equipment Details</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-muted-foreground">Type:</div>
                    <div>{selectedNode.data.label}</div>
                    <div className="text-muted-foreground">CAPEX Contribution:</div>
                    <div>$250,000</div>
                    <div className="text-muted-foreground">OPEX Contribution:</div>
                    <div>$75,000/year</div>
                  </div>
                </div>
              )}

              {selectedNode && selectedNode.type === "alternative" && (
                <div className="space-y-4">
                  <div className="text-sm font-semibold">Equipment Options</div>

                  {/* Options Cards */}
                  <div className="space-y-3">
                    {selectedNode.data.options.map((option, index) => {
                      const isRecommended = index === 0
                      const isSelected = selectedNode.data.selected === option.value

                      // Only calculate differences for non-recommended options
                      const capexDiff = !isRecommended ? option.capex - selectedNode.data.options[0].capex : null
                      const opexDiff = !isRecommended ? option.opex - selectedNode.data.options[0].opex : null

                      return (
                        <Card
                          key={option.value}
                          className={`border-gray-200 hover:border-emerald-200 cursor-pointer transition-all ${
                            isSelected ? "border-emerald-500 shadow-md" : ""
                          } ${isRecommended && !isSelected ? "bg-emerald-50 border-emerald-200" : ""}`}
                          onClick={() => handleOptionSelect(selectedNode.data.category, option.value)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-medium">{option.label}</div>
                              {isRecommended && (
                                <div className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                                  Recommended
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">{option.description}</div>
                            <div className="grid grid-cols-1 gap-1 text-xs mt-2">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">CAPEX:</span>
                                <div className="font-semibold text-right">
                                  ${option.capex.toLocaleString()}
                                  {!isRecommended && (
                                    <span className={`ml-1 ${capexDiff > 0 ? "text-red-500" : "text-emerald-500"}`}>
                                      ({capexDiff > 0 ? "+" : ""}
                                      {capexDiff.toLocaleString()})
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">OPEX:</span>
                                <div className="font-semibold text-right">
                                  ${option.opex.toLocaleString()}/year
                                  {!isRecommended && (
                                    <span className={`ml-1 ${opexDiff > 0 ? "text-red-500" : "text-emerald-500"}`}>
                                      ({opexDiff > 0 ? "+" : ""}
                                      {opexDiff.toLocaleString()})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Current selection:{" "}
                    <span className="font-medium text-foreground">
                      {selectedNode.data.options.find((opt) => opt.value === selectedNode.data.selected)?.label}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
