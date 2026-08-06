'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Copy,
  ExternalLink,
  Hash,
  Box,
  Calendar,
  FileText,
  RefreshCw,
  Link2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface BlockchainProof {
  documentId: string
  documentReference: string
  documentTitle: string
  hash: string
  transactionId: string
  blockNumber: number
  timestamp: string
  network: string
  verified: boolean
}

interface VerificationResult {
  verified: boolean
  documentId: string
  documentReference: string
  hash: string
  storedHash?: string
  hashMatch?: boolean
  timestamp?: string
  verificationDate: string
  details: {
    documentIntegrity: boolean
    tamperEvidence: boolean
    authenticity: boolean
  }
  warnings?: string[]
}

interface ProofPanelProps {
  documentId: string
  documentReference?: string
  documentTitle?: string
  proof?: BlockchainProof | null
  onRegister?: () => Promise<void>
  onVerify?: () => Promise<VerificationResult>
  isRegistering?: boolean
  isVerifying?: boolean
  className?: string
}

export function ProofPanel({
  documentId,
  documentReference,
  documentTitle,
  proof,
  onRegister,
  onVerify,
  isRegistering = false,
  isVerifying = false,
  className,
}: ProofPanelProps) {
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleVerify = async () => {
    if (!onVerify) return
    const result = await onVerify()
    setVerificationResult(result)
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-base">Preuve Blockchain</CardTitle>
            <CardDescription>
              Certification et vérification d&apos;authenticité
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Document info */}
        {documentReference && (
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Document:</span>
            <span className="font-medium">{documentReference}</span>
          </div>
        )}

        {/* Not registered state */}
        {!proof && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Ce document n&apos;est pas encore enregistré sur la blockchain.
            </AlertDescription>
          </Alert>
        )}

        {/* Proof details */}
        <AnimatePresence mode="wait">
          {proof ? (
            <motion.div
              key="proof"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {/* Status badge */}
              <div className="flex items-center justify-between">
                <Badge variant={proof.verified ? 'default' : 'secondary'} className="gap-1">
                  {proof.verified ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Vérifié
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3 w-3" />
                      Non vérifié
                    </>
                  )}
                </Badge>
                <span className="text-xs text-muted-foreground">{proof.network}</span>
              </div>

              {/* Transaction hash */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Link2 className="h-3 w-3" />
                  Hash de transaction
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">
                    {proof.transactionId}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => handleCopy(proof.transactionId, 'tx')}
                  >
                    {copied === 'tx' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Document hash */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  Hash du document
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">
                    {proof.hash.substring(0, 32)}...
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => handleCopy(proof.hash, 'hash')}
                  >
                    {copied === 'hash' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Block info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Box className="h-3 w-3" />
                    Bloc
                  </label>
                  <div className="p-2 bg-muted rounded text-sm font-mono">
                    #{proof.blockNumber.toLocaleString()}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Date
                  </label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {format(new Date(proof.timestamp), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : isRegistering ? (
            <motion.div
              key="registering"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-8 w-3/4" />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Verification result */}
        {verificationResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'p-3 rounded-lg border',
              verificationResult.verified 
                ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              {verificationResult.verified ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={cn(
                'font-medium',
                verificationResult.verified ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
              )}>
                {verificationResult.verified ? 'Document authentifié' : 'Échec de vérification'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className={cn(
                'flex items-center gap-1',
                verificationResult.details.documentIntegrity ? 'text-green-600' : 'text-red-600'
              )}>
                {verificationResult.details.documentIntegrity ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                Intégrité
              </div>
              <div className={cn(
                'flex items-center gap-1',
                verificationResult.details.tamperEvidence ? 'text-green-600' : 'text-red-600'
              )}>
                {verificationResult.details.tamperEvidence ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                Non modifié
              </div>
              <div className={cn(
                'flex items-center gap-1',
                verificationResult.details.authenticity ? 'text-green-600' : 'text-red-600'
              )}>
                {verificationResult.details.authenticity ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                Authentique
              </div>
            </div>

            {verificationResult.warnings && verificationResult.warnings.length > 0 && (
              <div className="mt-2 space-y-1">
                {verificationResult.warnings.map((warning, index) => (
                  <p key={index} className="text-xs text-amber-600">⚠️ {warning}</p>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!proof ? (
            <Button
              onClick={onRegister}
              disabled={isRegistering}
              className="flex-1"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Enregistrer sur la blockchain
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleVerify}
                disabled={isVerifying}
                className="flex-1"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Vérifier l&apos;authenticité
                  </>
                )}
              </Button>
              <Button variant="outline" size="icon">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Compact version for inline use
export function ProofBadge({ verified }: { verified: boolean }) {
  return (
    <Badge 
      variant={verified ? 'default' : 'secondary'}
      className={cn(
        'gap-1',
        verified && 'bg-green-600 hover:bg-green-700'
      )}
    >
      <Shield className="h-3 w-3" />
      {verified ? 'Certifié' : 'Non certifié'}
    </Badge>
  )
}
