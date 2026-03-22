import { useDocuments } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Search, Calendar, Loader2, FolderOpen } from 'lucide-react';
import { useState } from 'react';

export default function Documents() {
  const { data: documents, isLoading } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = (documents || []).filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.category?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set((documents || []).map((d) => d.category).filter(Boolean))];

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Public Documents</h1>
        <p className="text-muted-foreground">
          Access municipal policies, tenders, and official documents.
        </p>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge key={category} variant="secondary" className="cursor-pointer">
              {category}
            </Badge>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Documents List */}
      {filteredDocs.length > 0 ? (
        <div className="grid gap-4">
          {filteredDocs.map((doc, index) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-card hover:shadow-elegant transition-all animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-medium">{doc.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    {doc.category && (
                      <Badge variant="outline" className="text-xs">
                        {doc.category}
                      </Badge>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                    <span>{formatFileSize(doc.file_size)}</span>
                  </div>
                  {doc.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {doc.description}
                    </p>
                  )}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(doc.file_url, '_blank')}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No documents found</h3>
          <p className="text-sm text-muted-foreground">
            {documents?.length === 0
              ? 'No documents have been uploaded yet.'
              : 'Try adjusting your search query.'}
          </p>
        </div>
      )}
    </div>
  );
}