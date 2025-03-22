import React from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { increment, decrement, incrementByAmount, reset } from '@/redux/slices/counterSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Counter() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();
  const [incrementAmount, setIncrementAmount] = React.useState('2');

  const incrementValue = Number(incrementAmount) || 0;

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold text-center">Redux Counter Example</h2>
      
      <div className="text-center text-4xl font-bold py-4">{count}</div>
      
      <div className="flex justify-center gap-2">
        <Button 
          variant="outline"
          onClick={() => dispatch(decrement())}
        >
          -
        </Button>
        <Button 
          variant="outline"
          onClick={() => dispatch(increment())}
        >
          +
        </Button>
      </div>
      
      <div className="flex items-center gap-2 mt-4">
        <Input
          className="flex-grow"
          aria-label="Set increment amount"
          value={incrementAmount}
          onChange={(e) => setIncrementAmount(e.target.value)}
          type="number"
        />
        <Button
          onClick={() => dispatch(incrementByAmount(incrementValue))}
        >
          Add Amount
        </Button>
        <Button 
          variant="destructive"
          onClick={() => dispatch(reset())}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}