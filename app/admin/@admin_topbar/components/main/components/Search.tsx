import { Search as SearchIcon, Command } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchProps {
  query: string
  onSearchChange: (value: string) => void
  onMobileClick: () => void
}

export const Search = ({ query, onSearchChange, onMobileClick }: SearchProps) => {
  return (
    <>
      <div className="flex-1 max-w-md mx-4 sm:mx-8 hidden lg:block">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users, settings, logs..."
            value={query}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 bg-accent/30 border-border/50 focus:bg-background/80 focus:border-primary/50 transition-all duration-200 rounded-xl"
          />
        </div>
      </div>

      <Button 
        variant="ghost" 
        size="icon" 
        className="lg:hidden hover:bg-accent/50 transition-all duration-200 rounded-xl"
        onClick={onMobileClick}
      >
        <SearchIcon className="h-5 w-5" />
      </Button>
    </>
  )
} 