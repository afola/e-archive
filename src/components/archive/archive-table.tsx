'use client'

import { useState } from 'react'
import { 
  ColumnDef, 
  flexRender, 
  getCoreRowModel, 
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  Move,
  FileCheck,
  Trash2,
  Copy
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from './status-badge'
import { ConfidentialityBadge } from './confidentiality-badge'
import { Archive } from '@/store/archive-store'
import { cn } from '@/lib/utils'

interface ArchiveTableProps {
  data: Archive[]
  onView?: (archive: Archive) => void
  onEdit?: (archive: Archive) => void
  onDownload?: (archive: Archive) => void
  onMove?: (archive: Archive) => void
  onBorrow?: (archive: Archive) => void
  onDelete?: (archive: Archive) => void
  className?: string
}

export function ArchiveTable({ 
  data, 
  onView, 
  onEdit, 
  onDownload, 
  onMove, 
  onBorrow,
  onDelete,
  className 
}: ArchiveTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  const columns: ColumnDef<Archive>[] = [
    {
      accessorKey: 'reference',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Référence
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">{row.original.reference}</span>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Titre',
      cell: ({ row }) => (
        <div className="max-w-xs">
          <p className="truncate font-medium text-sm">{row.original.title}</p>
          {row.original.clientName && (
            <p className="text-xs text-muted-foreground truncate">{row.original.clientName}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'typeName',
      header: 'Type',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.typeName}</span>
      ),
    },
    {
      accessorKey: 'agencyName',
      header: 'Agence',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.agencyName}</span>
      ),
    },
    {
      accessorKey: 'archiveDate',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date archive
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.archiveDate)
        return <span className="text-sm">{date.toLocaleDateString('fr-FR')}</span>
      },
    },
    {
      accessorKey: 'retentionEndDate',
      header: 'Fin conservation',
      cell: ({ row }) => {
        const date = new Date(row.original.retentionEndDate)
        const now = new Date()
        const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        const isExpiringSoon = diffDays > 0 && diffDays <= 90
        const isExpired = diffDays <= 0
        
        return (
          <div className="flex flex-col">
            <span className="text-sm">{date.toLocaleDateString('fr-FR')}</span>
            {isExpiringSoon && (
              <span className="text-xs text-amber-600 font-medium">
                {diffDays}j restants
              </span>
            )}
            {isExpired && (
              <span className="text-xs text-red-600 font-medium">Expirée</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" />,
    },
    {
      accessorKey: 'confidentiality',
      header: 'Confidentialité',
      cell: ({ row }) => <ConfidentialityBadge level={row.original.confidentiality} size="sm" />,
    },
    {
      accessorKey: 'version',
      header: 'V.',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">v{row.original.version}</span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onView?.(row.original)}>
              <Eye className="mr-2 h-4 w-4" />
              Voir détail
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit?.(row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload?.(row.original)}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onMove?.(row.original)}>
              <Move className="mr-2 h-4 w-4" />
              Déplacer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBorrow?.(row.original)}>
              <FileCheck className="mr-2 h-4 w-4" />
              Emprunter
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 cursor-pointer"
              onClick={() => onDelete?.(row.original)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Demander destruction
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table's useReactTable is designed to work without memoization
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const pageCount = Math.ceil(data.length / pageSize)
  const currentPage = pageIndex + 1

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="wait">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Aucune archive trouvée.
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Afficher</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value))
              setPageIndex(0)
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            sur {data.length} résultats
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(0)}
            disabled={pageIndex === 0}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(pageIndex - 1)}
            disabled={pageIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm tabular-nums">
            Page {currentPage} sur {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(pageIndex + 1)}
            disabled={pageIndex >= pageCount - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(pageCount - 1)}
            disabled={pageIndex >= pageCount - 1}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
