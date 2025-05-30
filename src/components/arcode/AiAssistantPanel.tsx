
"use client";

import React, { useState } from 'react';
import { useArcodeContext } from '@/hooks/useArcodeContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

import { explainCode, ExplainCodeInput, ExplainCodeOutput } from '@/ai/flows/explain-code';
import { debugCode, DebugCodeInput, DebugCodeOutput } from '@/ai/flows/debug-code';
import { refactorCode, RefactorCodeInput, RefactorCodeOutput } from '@/ai/flows/refactor-code';

type AiAction = "explain" | "debug" | "refactor";

const AiAssistantPanel: React.FC = () => {
  const { activeFileId, getFileById } = useArcodeContext();
  const [currentAction, setCurrentAction] = useState<AiAction>("explain");
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [additionalInput, setAdditionalInput] = useState<string>("");
  const { toast } = useToast();

  const activeFile = activeFileId ? getFileById(activeFileId) : null;

  const handleAiAction = async () => {
    if (!activeFile) {
      toast({ title: "Error", description: "No active file selected.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setAiResponse("");

    try {
      let result: ExplainCodeOutput | DebugCodeOutput | RefactorCodeOutput | null = null;
      const code = activeFile.content;
      const language = activeFile.language;

      if (currentAction === "explain") {
        const input: ExplainCodeInput = { code, language };
        result = await explainCode(input);
        setAiResponse((result as ExplainCodeOutput).explanation);
      } else if (currentAction === "debug") {
        const input: DebugCodeInput = { code, language, description: additionalInput || "Help debug this code." };
        result = await debugCode(input);
        const debugResult = result as DebugCodeOutput;
        setAiResponse(`Debugging Suggestions:\n${debugResult.debuggingSuggestions}\n\nRefactored Code:\n\`\`\`${language}\n${debugResult.refactoredCode}\n\`\`\``);
      } else if (currentAction === "refactor") {
        if (!additionalInput.trim()) {
          toast({ title: "Input Required", description: "Please provide refactoring instructions.", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        const input: RefactorCodeInput = { code, instructions: additionalInput };
        result = await refactorCode(input);
        const refactorResult = result as RefactorCodeOutput;
        setAiResponse(`Explanation:\n${refactorResult.explanation}\n\nRefactored Code:\n\`\`\`${language}\n${refactorResult.refactoredCode}\n\`\`\``);
      }
      toast({ title: "AI Task Completed", description: `Successfully processed ${currentAction} action.` });
    } catch (error) {
      console.error("AI Action Error:", error);
      setAiResponse("An error occurred while processing your request.");
      toast({ title: "AI Error", description: "Failed to process your request.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      // Keep additionalInput for debug/refactor if user wants to re-run with slight modifications
      // setAdditionalInput(""); 
    }
  };

  const getAdditionalInputLabel = () => {
    if (currentAction === "debug") return "Describe the problem (optional):";
    if (currentAction === "refactor") return "Refactoring instructions:";
    return "";
  };

  return (
    <Card className="h-full flex flex-col border-0 shadow-none rounded-none">
      <CardHeader className="py-2 px-3 border-b">
        <CardTitle className="text-xs font-medium uppercase tracking-wider flex items-center gap-2">
          <Wand2 size={16} /> AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-3 flex flex-col gap-3 overflow-hidden">
        {aiResponse ? (
          <div className="flex-grow flex flex-col overflow-hidden border rounded-md">
            <Label className="text-xs px-3 py-1.5 border-b bg-muted/30">AI Response:</Label>
            <ScrollArea className="flex-grow p-3 bg-muted/10">
              <pre className="whitespace-pre-wrap text-xs font-mono">{aiResponse}</pre>
            </ScrollArea>
          </div>
        ) : (
           <div className="flex-grow flex items-center justify-center">
             <p className="text-xs text-muted-foreground text-center">
              {activeFile ? `Select an action below to run on '${activeFile.name}'.` : "Open a file and select an action below."}
            </p>
           </div>
        )}
      </CardContent>
      <CardFooter className="p-3 border-t flex flex-col gap-3">
        <div className="flex gap-2 w-full">
          {(["explain", "debug", "refactor"] as AiAction[]).map(action => (
            <Button
              key={action}
              variant={currentAction === action ? "default" : "outline"}
              size="sm"
              onClick={() => { setCurrentAction(action); setAiResponse(""); /* Don't clear additionalInput here */ }}
              className="capitalize flex-1 text-xs"
            >
              {action}
            </Button>
          ))}
        </div>
        
        { (currentAction === "debug" || currentAction === "refactor") && (
            <div className="space-y-1 w-full">
                <Label htmlFor="additional-input" className="text-xs">{getAdditionalInputLabel()}</Label>
                <Textarea
                id="additional-input"
                value={additionalInput}
                onChange={(e) => setAdditionalInput(e.target.value)}
                placeholder={currentAction === "debug" ? "e.g., 'Getting a TypeError on line 10'" : "e.g., 'Convert to async/await and add error handling'"}
                className="h-20 text-xs"
                disabled={isLoading}
                />
            </div>
        )}
        <Button onClick={handleAiAction} disabled={isLoading || !activeFile} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            {isLoading ? `Processing ${currentAction}...` : `Run ${currentAction} on current file`}
        </Button>
        {activeFile && <p className="text-xs text-muted-foreground text-center w-full">AI operates on the currently active file: {activeFile.name}</p>}
      </CardFooter>
    </Card>
  );
};

export default AiAssistantPanel;

    