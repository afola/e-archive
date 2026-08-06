'use client'

import { motion } from 'framer-motion'
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  XCircle, 
  Loader2,
  ChevronRight 
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface WorkflowStep {
  id: string
  label: string
  status: 'pending' | 'current' | 'completed' | 'rejected'
  date?: string
  user?: string
  comment?: string
}

interface WorkflowStepperProps {
  steps: WorkflowStep[]
  currentStep: number
  className?: string
}

const stepIcons = {
  pending: Circle,
  current: Clock,
  completed: CheckCircle2,
  rejected: XCircle,
}

const stepStyles = {
  pending: {
    icon: 'text-muted-foreground',
    label: 'text-muted-foreground',
    line: 'bg-muted',
  },
  current: {
    icon: 'text-blue-600 animate-pulse',
    label: 'text-blue-600 font-medium',
    line: 'bg-muted',
  },
  completed: {
    icon: 'text-emerald-600',
    label: 'text-foreground',
    line: 'bg-emerald-500',
  },
  rejected: {
    icon: 'text-red-600',
    label: 'text-red-600',
    line: 'bg-red-500',
  },
}

export function WorkflowStepper({ steps, currentStep, className }: WorkflowStepperProps) {
  return (
    <div className={cn('space-y-0', className)}>
      {steps.map((step, index) => {
        const Icon = stepIcons[step.status]
        const styles = stepStyles[step.status]
        const isLast = index === steps.length - 1

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex flex-col items-center">
                <div className={cn(
                  'rounded-full p-0.5',
                  step.status === 'current' && 'bg-blue-100 dark:bg-blue-950'
                )}>
                  <Icon className={cn('h-5 w-5', styles.icon)} />
                </div>
                {!isLast && (
                  <div className={cn(
                    'w-0.5 h-12 mt-2',
                    styles.line
                  )} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <div className="flex items-center gap-2">
                  <span className={cn('text-sm', styles.label)}>
                    {step.label}
                  </span>
                  {step.status === 'current' && (
                    <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                  )}
                </div>
                
                {step.user && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.user}
                  </p>
                )}
                
                {step.date && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(step.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
                
                {step.comment && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    "{step.comment}"
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// Vertical variant for compact display
export function WorkflowStepperCompact({ 
  steps, 
  currentStep 
}: { steps: WorkflowStep[]; currentStep: number }) {
  const completedSteps = steps.filter(s => s.status === 'completed').length
  const totalSteps = steps.length
  const progress = (completedSteps / totalSteps) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Étape {currentStep} sur {totalSteps}
        </span>
        <span className="font-medium">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <span className={cn(
              step.status === 'completed' && 'text-emerald-600',
              step.status === 'current' && 'text-blue-600 font-medium',
              step.status === 'rejected' && 'text-red-600'
            )}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <ChevronRight className="h-3 w-3 mx-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
