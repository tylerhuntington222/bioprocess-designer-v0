"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, FlaskConical, Save, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import ProcessSetupForm from "@/components/process-setup-form"
import ProcessFlowDiagram from "@/components/process-flow-diagram"
import ParameterPanel from "@/components/parameter-panel"
import CostEstimation from "@/components/cost-estimation"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { useFirebaseAuth } from "@/hooks/use-firebase-auth"

export default function ProjectPage({ params }) {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [activeTab, setActiveTab] = useState("diagram")
  const [projectName, setProjectName] = useState("Untitled Project")
  const [projectDescription, setProjectDescription] = useState("")
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [processParameters, setProcessParameters] = useState({
    // Product Specs
    productType: "Monoclonal Antibody",
    marketValue: 500,
    stateOfMatter: "Liquid",
    density: 1.03,
    titer: 5,
    molecularWeight: 150,
    boilingPoint: 100,
    vaporPressure: 0.023,
    requiredPurity: 99.5,
    specificHeatCapacity: 4.18,
    solubility: "High",
    crystallizable: false,
    productAccumulation: "Extracellular",

    // Microbe Properties
    microbialHost: "CHO",
    cellDiameter: 15,

    // Process Parameters
    facilityWorkingTime: 7920,
    flowRateFromFermentation: 1000,
    electricityPrice: 0.12,
    onsiteStorageTime: 30,
    productConcentrationMethod: "Chromatography",

    // Selected Alternatives
    harvestClarification: "Centrifuge",
    captureStep: "Standard Resin",
    bufferPrep: "Stainless Steel Tanks",
  })

  // Use our custom hook to get auth, db, and user
  const { auth, db, user, loading } = useFirebaseAuth()

  // Load project data when user and db are available
  useEffect(() => {
    if (user && db && params.id !== "new") {
      loadProject(params.id, user.uid)
    }
  }, [user, db, params.id])

  // Load project from Firestore
  const loadProject = async (projectId, userId) => {
    try {
      const projectRef = doc(db, "users", userId, "projects", projectId)
      const projectSnap = await getDoc(projectRef)

      if (projectSnap.exists()) {
        const projectData = projectSnap.data()
        setProjectName(projectData.name)
        setProjectDescription(projectData.description)
        setProcessParameters(projectData.parameters)
      }
    } catch (error) {
      console.error("Error loading project:", error)
      toast({
        title: "Error",
        description: "Failed to load project data.",
        variant: "destructive",
      })
    }
  }

  const handleParameterChange = (name, value) => {
    setProcessParameters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSetupComplete = (parameters) => {
    setProcessParameters((prev) => ({
      ...prev,
      ...parameters,
    }))
    setIsSetupComplete(true)
    // Set the active tab to "diagram" when setup is complete
    setActiveTab("diagram")
  }

  const handleAlternativeSelection = (category, value) => {
    setProcessParameters((prev) => ({
      ...prev,
      [category]: value,
    }))
  }

  const handleSaveProject = async () => {
    if (!user || !db) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your project.",
        variant: "destructive",
      })
      setIsSaveDialogOpen(false)
      router.push("/login")
      return
    }

    try {
      // Create project data
      const projectData = {
        id: params.id === "new" ? Date.now().toString() : params.id,
        name: projectName,
        description: projectDescription,
        parameters: processParameters,
        lastModified: new Date().toISOString(),
        status: "in-progress",
        userId: user.uid,
      }

      // Save to Firestore
      const projectRef = doc(db, "users", user.uid, "projects", projectData.id)
      await setDoc(projectRef, projectData)

      toast({
        title: "Project Saved",
        description: `"${projectName}" has been saved to your projects.`,
      })

      setIsSaveDialogOpen(false)

      // If this is a new project, redirect to the saved project URL
      if (params.id === "new") {
        router.push(`/project/${projectData.id}`)
      }
    } catch (error) {
      console.error("Error saving project:", error)
      toast({
        title: "Error",
        description: "Failed to save project. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleExportPDF = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to export your project.",
        variant: "destructive",
      })
      setIsExportDialogOpen(false)
      router.push("/login")
      return
    }

    setIsExporting(true)
    toast({
      title: "Generating PDF",
      description: "Please wait while we generate your PDF...",
    })

    try {
      // Create a new PDF document
      const pdf = new jsPDF("p", "mm", "a4")

      // Add title and metadata
      pdf.setFontSize(22)
      pdf.text(projectName, 20, 20)

      pdf.setFontSize(12)
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30)
      pdf.text(`Project Description: ${projectDescription || "No description provided"}`, 20, 40)

      // Add process parameters section
      pdf.setFontSize(16)
      pdf.text("Process Parameters", 20, 55)

      pdf.setFontSize(10)
      let yPos = 65

      // Product specs
      pdf.setFontSize(12)
      pdf.text("Product Specifications", 20, yPos)
      yPos += 8

      pdf.setFontSize(10)
      pdf.text(`Product Type: ${processParameters.productType}`, 25, yPos)
      yPos += 6
      pdf.text(`Market Value: ${processParameters.marketValue}/g`, 25, yPos)
      yPos += 6
      pdf.text(`Titer: ${processParameters.titer} g/L`, 25, yPos)
      yPos += 6
      pdf.text(`Required Purity: ${processParameters.requiredPurity}%`, 25, yPos)
      yPos += 6

      // Microbe properties
      yPos += 4
      pdf.setFontSize(12)
      pdf.text("Microbe Properties", 20, yPos)
      yPos += 8

      pdf.setFontSize(10)
      pdf.text(`Microbial Host: ${processParameters.microbialHost}`, 25, yPos)
      yPos += 6
      pdf.text(`Cell Diameter: ${processParameters.cellDiameter} μm`, 25, yPos)
      yPos += 6

      // Selected alternatives
      yPos += 4
      pdf.setFontSize(12)
      pdf.text("Selected Equipment Alternatives", 20, yPos)
      yPos += 8

      pdf.setFontSize(10)
      pdf.text(`Harvest Clarification: ${processParameters.harvestClarification}`, 25, yPos)
      yPos += 6
      pdf.text(`Capture Step: ${processParameters.captureStep}`, 25, yPos)
      yPos += 6
      pdf.text(`Buffer Preparation: ${processParameters.bufferPrep}`, 25, yPos)
      yPos += 6

      // Add a new page for the process flow diagram
      pdf.addPage()
      pdf.setFontSize(16)
      pdf.text("Process Flow Diagram", 20, 20)

      // Capture the process flow diagram
      const diagramElement = document.querySelector(".react-flow")
      if (diagramElement) {
        const canvas = await html2canvas(diagramElement, {
          scale: 1,
          useCORS: true,
          allowTaint: true,
        })

        const imgData = canvas.toDataURL("image/png")
        pdf.addImage(imgData, "PNG", 15, 30, 180, 100)
      }

      // Add a new page for the techno-economic analysis
      pdf.addPage()
      pdf.setFontSize(16)
      pdf.text("Techno-economic Analysis", 20, 20)

      // Calculate economic values
      const calculateCapex = () => {
        let baseCapex = 10000000
        if (processParameters.productType === "Monoclonal Antibody") baseCapex *= 1.2
        else if (processParameters.productType === "Vaccine") baseCapex *= 1.5

        baseCapex *= (processParameters.flowRateFromFermentation / 1000) * 0.8

        if (processParameters.harvestClarification === "Centrifuge") baseCapex += 500000
        else baseCapex += 300000

        if (processParameters.captureStep === "Large Resin") baseCapex += 800000
        else baseCapex += 500000

        if (processParameters.bufferPrep === "Stainless Steel Tanks") baseCapex += 400000
        else baseCapex += 200000

        return baseCapex
      }

      const calculateOpex = () => {
        let baseOpex = 2000000
        baseOpex *= (processParameters.facilityWorkingTime / 8000) * 0.9
        baseOpex += processParameters.electricityPrice * 1000000

        if (processParameters.harvestClarification === "Centrifuge") baseOpex += 100000
        else baseOpex += 150000

        if (processParameters.captureStep === "Large Resin") baseOpex += 250000
        else baseOpex += 150000

        if (processParameters.bufferPrep === "Stainless Steel Tanks") baseOpex += 50000
        else baseOpex += 100000

        return baseOpex
      }

      const calculateMsp = (capex, opex) => {
        const annualProduction =
          (processParameters.titer *
            processParameters.flowRateFromFermentation *
            processParameters.facilityWorkingTime) /
          1000
        const annualCapexCost = capex / 10
        const totalAnnualCost = annualCapexCost + opex
        return totalAnnualCost / annualProduction
      }

      const capex = calculateCapex()
      const opex = calculateOpex()
      const msp = calculateMsp(capex, opex)

      const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value)
      }

      yPos = 30
      pdf.setFontSize(12)
      pdf.text(`CAPEX: ${formatCurrency(capex)}`, 20, yPos)
      yPos += 8
      pdf.text(`Annual OPEX: ${formatCurrency(opex)}`, 20, yPos)
      yPos += 8
      pdf.text(`Minimum Selling Price (MSP): ${formatCurrency(msp)}/kg`, 20, yPos)
      yPos += 8

      // Add key observations
      yPos += 8
      pdf.setFontSize(14)
      pdf.text("Key Observations:", 20, yPos)
      yPos += 8

      pdf.setFontSize(10)
      if (processParameters.harvestClarification === "Centrifuge") {
        pdf.text(
          "• Using centrifugation for harvest clarification increases CAPEX but reduces OPEX compared to depth filtration.",
          20,
          yPos,
        )
      } else {
        pdf.text(
          "• Using depth filtration for harvest clarification reduces CAPEX but increases OPEX due to consumables cost.",
          20,
          yPos,
        )
      }
      yPos += 6

      if (processParameters.captureStep === "Large Resin") {
        pdf.text(
          "• The larger resin column size increases initial investment but may provide better throughput.",
          20,
          yPos,
        )
      } else {
        pdf.text("• The standard resin column size provides a good balance between cost and performance.", 20, yPos)
      }
      yPos += 6

      if (processParameters.bufferPrep === "Stainless Steel Tanks") {
        pdf.text("• Stainless steel tanks for buffer preparation have higher CAPEX but lower OPEX over time.", 20, yPos)
      } else {
        pdf.text(
          "• Single-use bags for buffer preparation reduce CAPEX but increase ongoing consumables cost.",
          20,
          yPos,
        )
      }

      // Save the PDF
      const filename = `${projectName.replace(/\s+/g, "_")}_Report.pdf`
      pdf.save(filename)

      setIsExporting(false)
      setIsExportDialogOpen(false)

      toast({
        title: "PDF Generated",
        description: "Your project has been exported as a PDF.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      setIsExporting(false)

      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to Dashboard</span>
              </Button>
            </Link>
            <FlaskConical className="h-6 w-6 text-emerald-500" />
            <span className="text-xl font-bold">BioProcess Designer</span>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Project</DialogTitle>
                  <DialogDescription>Enter a name and description for your project.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input id="project-name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="project-description">Description (Optional)</Label>
                    <Input
                      id="project-description"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProject}>Save Project</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export Project</DialogTitle>
                  <DialogDescription>Choose export options for your bioprocess design.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-start space-x-2">
                    <div className="p-2 bg-amber-50 rounded-full">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      The PDF will include all process parameters, the process flow diagram, selected alternatives, and
                      the complete techno-economic analysis.
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="export-filename">Filename</Label>
                    <Input id="export-filename" value={`${projectName.replace(/\s+/g, "_")}_Report`} disabled />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsExportDialogOpen(false)} disabled={isExporting}>
                    Cancel
                  </Button>
                  <Button onClick={handleExportPDF} disabled={isExporting}>
                    {isExporting ? "Generating PDF..." : "Export PDF"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto">
          {!isSetupComplete ? (
            <ProcessSetupForm
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              onComplete={handleSetupComplete}
              initialData={processParameters}
            />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Process Design</h1>
                <Button variant="outline" onClick={() => setIsSetupComplete(false)}>
                  Edit Setup Parameters
                </Button>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="parameters">Parameters</TabsTrigger>
                  <TabsTrigger value="diagram">Process Flow Diagram</TabsTrigger>
                  <TabsTrigger value="economics">Techno-economic Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="parameters" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <ParameterPanel parameters={processParameters} onParameterChange={handleParameterChange} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="diagram" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <ProcessFlowDiagram
                        parameters={processParameters}
                        onAlternativeSelection={handleAlternativeSelection}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="economics" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <CostEstimation parameters={processParameters} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
