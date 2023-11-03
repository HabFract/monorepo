import { DarkThemeToggle, Flowbite, Button } from 'flowbite-react';
import { Card } from 'flowbite-react';

export default function MyPage() {
  return (
    <Flowbite>
      <DarkThemeToggle />
      <Card
      imgAlt="Meaningful alt text for an image that is not purely decorative"
      imgSrc="/images/blog/image-1.jpg"
    >
      <h5 className="text-2xl font-light tracking-wide text-gray-900 dark:text-white">
        <p>
          Noteworthy technology acquisitions 2021
        </p>
      </h5>
      <p className="font-normal text-gray-700 dark:text-gray-400">
        <p>
          Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.
        </p>
      </p>
    </Card> 
      <Button>Click me</Button>
    </Flowbite>
  );
}
