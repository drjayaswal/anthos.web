import Image from 'next/image';

const Restriction = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="z-10 flex flex-col items-center max-w-sm w-full text-center">
        <div className="space-y-4">
          <Image
            src="/anthos.svg"
            alt="anthos"
            width={100}
            height={100}
            quality={90}
            style={{ width: '240px', height: 'auto' }}
            priority
          />
        </div>

        <div className="w-full p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-xl tracking-tight text-black">Admin Only</h1>
            <p className="text-sm text-red-600">Restricted Route</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Restriction