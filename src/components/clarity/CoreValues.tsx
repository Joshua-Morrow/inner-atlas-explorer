import { useState } from 'react';
import { useClarityStore, VALUES_LIST, ValueEntry, ValueBucket, ValueHolder } from '@/lib/clarityStore';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Gem } from 'lucide-react';

const BUCKET_LABELS: Record<ValueBucket, string> = {
  essential: 'Essential to who I am',
  'very-important': 'Very important but not core',
  important: 'Important but not defining',
};

const HOLDER_COLORS: Record<ValueHolder, string> = {
  self: 'hsl(var(--ifs-self))',
  part: 'hsl(var(--ifs-manager))',
  both: 'hsl(var(--primary))',
};

export default function CoreValues() {
  const { selectedValues, setSelectedValues, valueEntries, setValueEntries, valuesStage, setValuesStage } = useClarityStore();
  const parts = useStore((s) => s.parts);

  const toggleValue = (v: string) => {
    setSelectedValues(selectedValues.includes(v) ? selectedValues.filter((x) => x !== v) : [...selectedValues, v]);
  };

  const initEntries = () => {
    const existing = new Set(valueEntries.map((e) => e.value));
    const newEntries = selectedValues.filter((v) => !existing.has(v)).map((v): ValueEntry => ({
      value: v, bucket: 'important', holder: 'self',
    }));
    setValueEntries([...valueEntries.filter((e) => selectedValues.includes(e.value)), ...newEntries]);
  };

  const updateEntry = (value: string, data: Partial<ValueEntry>) => {
    setValueEntries(valueEntries.map((e) => e.value === value ? { ...e, ...data } : e));
  };

  const essentialValues = valueEntries.filter((e) => e.bucket === 'essential');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Core Values — Stage {valuesStage} of 3</h2>
      </div>
      <div className="flex gap-1">
        {[1,2,3].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= valuesStage ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>

      {valuesStage === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Select all values that resonate with you — no limit.</p>

          <div className="bg-muted/30 rounded-lg p-3 space-y-2 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Reflection prompts:</p>
            <p>• When have you felt most proud? What values were you honoring?</p>
            <p>• What behaviors in others do you find intolerable? What values do those violate?</p>
            <p>• What would you refuse to compromise even under pressure?</p>
          </div>

          {VALUES_LIST.map((cat) => (
            <div key={cat.category}>
              <Label className="text-xs text-muted-foreground mb-1 block">{cat.category}</Label>
              <div className="flex flex-wrap gap-1.5">
                {cat.values.map((v) => (
                  <button key={v}
                    className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${selectedValues.includes(v) ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-muted/50'}`}
                    onClick={() => toggleValue(v)}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <p className="text-xs text-muted-foreground">{selectedValues.length} values selected</p>
        </div>
      )}

      {valuesStage === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sort your {selectedValues.length} values into three buckets. Aim for 5–8 in "Essential."
          </p>

          {(['essential', 'very-important', 'important'] as ValueBucket[]).map((bucket) => {
            const items = valueEntries.filter((e) => e.bucket === bucket);
            return (
              <Card key={bucket}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    {BUCKET_LABELS[bucket]}
                    <Badge variant="outline" className="text-[10px]">{items.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5 min-h-[40px]">
                    {items.map((e) => (
                      <Badge key={e.value} variant="secondary" className="text-xs cursor-pointer hover:opacity-80"
                        onClick={() => {
                          const next: ValueBucket = bucket === 'essential' ? 'very-important' : bucket === 'very-important' ? 'important' : 'essential';
                          updateEntry(e.value, { bucket: next });
                        }}>
                        {e.value}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">Click a value to move it to the next bucket.</p>
                </CardContent>
              </Card>
            );
          })}

          {essentialValues.length > 10 && (
            <p className="text-xs text-destructive">Consider narrowing your Essential values to 5–8 for the deepest clarity.</p>
          )}
        </div>
      )}

      {valuesStage === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">For each essential value, identify who holds it.</p>

          {essentialValues.map((entry) => (
            <Card key={entry.value}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{entry.value}</span>
                  <div className="flex gap-1">
                    {(['self', 'part', 'both'] as ValueHolder[]).map((h) => (
                      <button key={h}
                        className={`text-[10px] px-2 py-1 rounded-full border ${entry.holder === h ? 'font-medium' : 'opacity-60'}`}
                        style={entry.holder === h ? { borderColor: HOLDER_COLORS[h], color: HOLDER_COLORS[h] } : {}}
                        onClick={() => updateEntry(entry.value, { holder: h })}>
                        {h === 'self' ? 'Self' : h === 'part' ? 'A Part' : 'Both'}
                      </button>
                    ))}
                  </div>
                </div>
                {(entry.holder === 'part' || entry.holder === 'both') && (
                  <div className="space-y-2 border-l-2 border-primary/20 pl-3">
                    <div>
                      <Label className="text-xs">Which part?</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {parts.map((p) => (
                          <button key={p.id}
                            className={`text-[10px] px-2 py-0.5 rounded-full border ${entry.partId === p.id ? 'bg-primary text-primary-foreground border-primary' : 'border-input'}`}
                            onClick={() => updateEntry(entry.value, { partId: p.id })}>
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">What is this part afraid would happen if you stopped honoring this value?</Label>
                      <Input value={entry.partFear || ''} onChange={(e) => updateEntry(entry.value, { partFear: e.target.value })}
                        className="text-xs h-8 mt-1" placeholder="e.g., I'd lose respect, I'd be alone..." />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Portrait */}
          {essentialValues.length > 0 && (
            <Card className="bg-gradient-to-br from-primary/5 to-card border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Gem className="h-4 w-4 text-primary" /> Core Values Portrait</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 justify-center">
                  {essentialValues.map((e) => (
                    <div key={e.value} className="px-4 py-2 rounded-xl border-2 text-sm font-medium"
                      style={{ borderColor: HOLDER_COLORS[e.holder], color: HOLDER_COLORS[e.holder], backgroundColor: `${HOLDER_COLORS[e.holder]}10` }}>
                      {e.value}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-4 mt-3 text-[10px]">
                  {Object.entries(HOLDER_COLORS).map(([key, color]) => (
                    <div key={key} className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      {key === 'self' ? 'Self-Held' : key === 'part' ? 'Part-Held' : 'Both'}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="ghost" size="sm" disabled={valuesStage <= 1} onClick={() => setValuesStage(valuesStage - 1)}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        {valuesStage < 3 ? (
          <Button size="sm" disabled={valuesStage === 1 && selectedValues.length === 0}
            onClick={() => { if (valuesStage === 1) initEntries(); setValuesStage(valuesStage + 1); }}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setValuesStage(1)}>Start Over</Button>
        )}
      </div>
    </div>
  );
}
