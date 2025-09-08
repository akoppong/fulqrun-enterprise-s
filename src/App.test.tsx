import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>CRM Preview Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">If you can see this, the preview is working!</p>
          <Button>Test Button</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;